import bleach
import json
import time
import uuid

from django.conf import settings

from dynamic_preferences.registries import global_preferences_registry

# from oc2.codec import Codec, jadn_check

from ..models import SentHistory, ResponseHistory

from orchestrator.models import Protocol, Serialization
from actuator.models import Actuator, ActuatorProfile
from device.models import Device

from tracking import log
from utils import encode_msg, get_or_none, safe_cast

global_preferences = global_preferences_registry.manager()


def validate_usr(usr=None):
    if usr is None:
        log.error(msg="invalid user attempted to send a command")
        return dict(
            detail="user invalid",
            response="User Invalid: command must be send by a valid user"
        ), 401


def validate_cmd(usr, cmd={}):
    if len(cmd.keys()) == 0:
        log.error(usr=usr, msg="User attempted to send an empty command")
        return dict(
            detail="command invalid",
            response="Command Invalid: command cannot be empty"
        ), 400

    '''
    # Validate command
    try:
        schema = jadn_check(actuators[0].schema)
        codec = Codec(schema, True, True)
    except (KeyError, ValueError) as e:
        log.error(usr=usr, msg=f"{actuator[0]} schema invalid - {e}")
        return dict(
            type="schema",
            msg=f"Schema Invalid: {e}"
        ), 400
        
    try:
        msg = codec.decode("OpenC2-Command", cmd)
    except (ValueError, TypeError) as e:
        log.error(usr=usr, msg=f"Command invalid - {e}")
        return dict(
            type="command",
            msg=f"Command Invalid: {e}"
        ), 400
    '''


def validate_actuator(usr, act=""):
    if act is None:  # TODO: actuator broadcast??
        log.error(usr=usr, msg="User attempted to send to a null actuator")
        return dict(
            detail="actuator invalid",
            response="Actuator Invalid: actuator cannot be none"
        ), 400

    act_type = act.split("/", 1)
    if len(act_type) != 2:
        log.error(usr=usr, msg=f"User attempted to send to an invalid actuator - {act}")
        return dict(
            detail="actuator invalid",
            response="Actuator Invalid: application error"
        ), 400

    _type, _act_prof = act_type
    _type = bleach.clean(str(_type))
    _act_prof = bleach.clean(str(_act_prof).replace("_", " "))

    if _type == "actuator":  # Single Actuator
        actuators = get_or_none(Actuator, actuator_id=_act_prof)
        if actuators is None:
            return dict(
                detail="actuator invalid",
                response="Actuator Invalid: actuator must be specified with a command"
            ), 404
        return [actuators, ]

    elif _type == "profile":  # Profile Actuators
        actuators = get_or_none(ActuatorProfile, name__iexact=_act_prof)
        if actuators is None:
            return dict(
                detail=f"profile cannot be found",
                response=f"Profile Invalid: profile must be a valid registered profile with the orchestrator"
            ), 400
        return list(Actuator.objects.filter(profile__iexact=_act_prof.replace(" ", "_")))
    else:
        return dict(
            detail="actuator invalid",
            response="Actuator Invalid: application error"
        ), 400


def validate_channel(act, chan={}):
    if len(act) == 1:
        act = act[0]
        if isinstance(act, Actuator):
            dev = get_or_none(Device, device_id=act.device.device_id)

            proto = chan.get("protocol", None)
            if proto:
                proto = get_or_none(dev.transport, protocol__name=bleach.clean(str(proto)))
                proto = proto.protocol if proto else None

            serial = chan.get("serialization", None)
            if serial:
                serial = get_or_none(Serialization, name=bleach.clean(str(serial)))

            return proto, serial
    return None, None


def action_send(usr=None, cmd={}, actuator="", channel={}):
    """
    Process a command prior to sending it to the specified actuator(s)/profile
    :param usr: user sending command
    :param cmd: OpenC2 command
    :param actuator: actuator/profile receiving command
    :param channel: serialization & protocol to send the command
    :return: response dict
    """
    err = validate_usr(usr)
    if err:
        return err

    err = validate_cmd(usr, cmd)
    if err:
        return err

    actuators = None
    err = validate_actuator(usr, actuator)
    if err:
        if isinstance(err, (Actuator, list)):
            actuators = err
        else:
            return err

    protocol, serialization = validate_channel(actuators, channel)

    # Store command in db
    cmd_id = cmd.get("id", uuid.uuid4())
    if get_or_none(SentHistory, command_id=cmd_id):
        return dict(
            command_id=[
                "This ID is used by another command."
            ]
        ), 400
    else:
        com = SentHistory(command_id=cmd_id, user=usr, command=cmd)
        try:
            com.save()
        except ValueError as e:
            return dict(
                detail="command error",
                response=str(e)
            ), 400

    orc_ip = global_preferences.get("orchestrator__host", "127.0.0.1")
    orc_id = global_preferences.get("orchestrator__id", "")
    # Process Actuators that should receive command
    processed_acts = set()

    # Process Protocols
    protocols = [protocol] if protocol else Protocol.objects.all()
    for proto in protocols:
        proto_acts = [a for a in actuators if a.device.transport.filter(protocol__name=proto.name).exists()]
        proto_acts = list(filter(lambda a: a.id not in processed_acts, proto_acts))
        processed_acts.update({act.id for act in proto_acts})

        if len(proto_acts) >= 1:
            if proto.name.lower() == "coap" and com.coap_id is b"":
                corr_id = com.gen_coap_id()
                com.save()
            else:
                corr_id = str(com.command_id)

            header = dict(
                source=dict(
                    orchestratorID=orc_id,
                    transport=dict(
                        type=proto.name,
                        socket=f"{orc_ip}:{proto.port}"
                    ),
                    correlationID=corr_id,
                    date=f"{com.received_on:%a, %d %b %Y %X %Z}"
                ),
                destination=[]
            )

            for act in proto_acts:
                com.actuators.add(act)
                trans = act.device.transport.filter(protocol__name=proto.name).first()
                encoding = (serialization if serialization else trans.serialization.first()).name.lower()

                dev = list(filter(lambda d: d["deviceID"] == str(act.device.device_id), header["destination"]))
                profile = str(act.profile).lower()

                if len(dev) == 1:
                    idx = header["destination"].index(dev[0])
                    header["destination"][idx]["profile"].append(profile)

                else:
                    header["destination"].append(dict(
                        deviceID=str(act.device.device_id),
                        socket=f"{trans.host}:{trans.port}",
                        profile=[profile],
                        encoding=encoding
                    ))

            # Send command to transport
            log.info(usr=usr, msg=f"Send command {com.command_id}/{com.coap_id.hex()} to buffer")
            settings.MESSAGE_QUEUE.send(
                msg=json.dumps(cmd),
                headers=header,
                routing_key=proto.name.lower().replace(" ", "_")
            )

    wait = safe_cast(global_preferences.get("command__wait", 1), int, 1)
    rsp = None
    for _ in range(wait):
        rsp = get_or_none(ResponseHistory, command=com)
        if rsp:
            break
        else:
            time.sleep(1)

    rsp = [r.response for r in rsp] if hasattr(rsp, "__iter__") else ([rsp.response] if hasattr(rsp, "response") else None)

    return dict(
        detail=f"command {'received' if rsp is None else 'processed'}",
        response=rsp if rsp else "pending",
        command_id=com.command_id,
        command=com.command,
        wait=wait
    ), 200
