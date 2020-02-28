import bleach
import json
import time
import uuid

from django.conf import settings
from django.contrib.auth import get_user_model
from dynamic_preferences.registries import global_preferences_registry

# Local imports
from actuator.models import Actuator, ActuatorProfile
from device.models import Device
from orchestrator.models import Protocol, Serialization
from tracking import log
from utils import get_or_none, safe_cast
from ..models import SentHistory, ResponseHistory

global_preferences = global_preferences_registry.manager()


class Validator:
    _usr: get_user_model()
    _cmd: dict
    _actuator: str
    _channel: dict

    def __init__(self, usr, cmd: dict, actuator: str, channel: dict):
        """
        Process a command prior to sending it to the specified actuator(s)/profile
        :param usr: user sending command
        :param cmd: OpenC2 command
        :param actuator: actuator/profile receiving command
        :param channel: serialization & protocol to send the command
        """
        self._usr = usr
        self._cmd = cmd or {}
        self._actuator = actuator
        self._channel = channel or {}

    def validate(self):
        """
        Validate given the class vars
        :return: response tuple or data tuple
        """
        err = self._val_user()
        if err:
            return err

        err = self._val_cmd()
        if err:
            return err

        actuators = None
        err = self._val_actuator()
        if err:
            if isinstance(err, (Actuator, list)):
                actuators = err
            else:
                return err

        protocol, serialization = self._val_channel(actuators)

        return actuators, protocol, serialization

    def _val_user(self):
        if self._usr is None:
            log.error(msg="invalid user attempted to send a command")
            return dict(
                detail="user invalid",
                response="User Invalid: command must be send by a valid user"
            ), 401
        return None

    def _val_cmd(self):
        if len(self._cmd.keys()) == 0:
            log.error(usr=self._usr, msg="User attempted to send an empty command")
            return dict(
                detail="command invalid",
                response="Command Invalid: command cannot be empty"
            ), 400

        # TODO: Validate command
        return None

    def _val_actuator(self):
        if self._actuator is None:  # TODO: Actuator broadcast??
            log.error(usr=self._usr, msg="User attempted to send to a null actuator")
            return dict(
                detail="actuator invalid",
                response="Actuator Invalid: actuator cannot be none"
            ), 400

        act_type = self._actuator.split("/", 1)
        if len(act_type) != 2:
            log.error(usr=self._usr, msg=f"User attempted to send to an invalid actuator - {self._actuator}")
            return dict(
                detail="actuator invalid",
                response="Actuator Invalid: application error"
            ), 400

        _type, _act_prof = act_type
        _type = bleach.clean(str(_type))
        _act_prof = bleach.clean(str(_act_prof).replace("_", " "))

        if _type == "actuator":  # Single Actuator
            actuators = get_or_none(Actuator, actuator_id=_act_prof)
            rtn = [actuators, ]
            if actuators is None:
                rtn = dict(
                    detail="actuator invalid",
                    response="Actuator Invalid: actuator must be specified with a command"
                ), 404
            return rtn

        if _type == "profile":  # Profile Actuators
            actuators = get_or_none(ActuatorProfile, name__iexact=_act_prof)
            if actuators is None:
                return dict(
                    detail=f"profile cannot be found",
                    response=f"Profile Invalid: profile must be a valid registered profile with the orchestrator"
                ), 400
            return list(Actuator.objects.filter(profile__iexact=_act_prof.replace(" ", "_")))

        return dict(
            detail="actuator invalid",
            response="Actuator Invalid: application error"
        ), 400

    def _val_channel(self, act: Actuator):
        if len(act) == 1:
            act = act[0]
            if isinstance(act, Actuator):
                dev = get_or_none(Device, device_id=act.device.device_id)

                proto = self._channel.get("protocol", None)
                if proto:
                    proto = get_or_none(dev.transport, protocol__name=bleach.clean(str(proto)))
                    proto = proto.protocol if proto else None

                serial = self._channel.get("serialization", None)
                if serial:
                    serial = get_or_none(Serialization, name=bleach.clean(str(serial)))

                return proto, serial
        return None, None


def get_headers(proto: Protocol, com: SentHistory, proto_acts, serial: Serialization):
    orc_ip = global_preferences.get("orchestrator__host", "127.0.0.1")
    orc_id = global_preferences.get("orchestrator__id", "")
    corr_id = com.coap_id or str(com.command_id)

    headers = dict(
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
        encoding = (serial if serial else trans.serialization.first()).name.lower()

        dev = [d for d in headers["destination"] if d["deviceID"] == str(act.device.device_id)]
        profile = str(act.profile).lower()

        if len(dev) == 1:
            idx = headers["destination"].index(dev[0])
            headers["destination"][idx]["profile"].append(profile)

        else:
            dest = dict(
                deviceID=str(act.device.device_id),
                socket=f"{trans.host}:{trans.port}",
                profile=[profile],
                encoding=encoding
            )
            if trans.protocol.pub_sub:
                dest.update(
                    topic=trans.topic,
                    channel=trans.channel
                )

            headers["destination"].append(dest)
    return headers


def action_send(usr, cmd: dict, actuator: str, channel: dict):
    """
    Process a command prior to sending it to the specified actuator(s)/profile
    :param usr: user sending command
    :param cmd: OpenC2 command
    :param actuator: actuator/profile receiving command
    :param channel: serialization & protocol to send the command
    :return: response Tuple(dict, int)
    """
    val = Validator(usr, cmd, actuator, channel)
    actuators, protocol, serialization = val.validate()

    # Store command in db
    cmd_id = cmd.get("id", uuid.uuid4())
    if get_or_none(SentHistory, command_id=cmd_id):
        return dict(
            command_id=[
                "This ID is used by another command."
            ]
        ), 400

    com = SentHistory(command_id=cmd_id, user=usr, command=cmd)
    try:
        com.save()
    except ValueError as e:
        return dict(
            detail="command error",
            response=str(e)
        ), 400

    # Process Actuators that should receive command
    processed_acts = set()

    # Process Protocols
    for proto in [protocol] if protocol else Protocol.objects.all():
        proto_acts = [a for a in actuators if a.device.transport.filter(protocol__name=proto.name).exists()]
        proto_acts = list(filter(lambda a: a.id not in processed_acts, proto_acts))
        processed_acts.update({act.id for act in proto_acts})

        if len(proto_acts) >= 1:
            if proto.name.lower() == "coap" and com.coap_id == b"":
                com.gen_coap_id()
                com.save()

            # Send command to transport
            log.info(usr=usr, msg=f"Send command {com.command_id}/{com.coap_id.hex()} to buffer")
            settings.MESSAGE_QUEUE.send(
                msg=json.dumps(cmd),
                headers=get_headers(proto, com, proto_acts, serialization),
                routing_key=proto.name.lower().replace(" ", "_")
            )

    wait = safe_cast(global_preferences.get("command__wait", 1), int, 1)
    rsp = None
    for _ in range(wait):
        rsp = get_or_none(ResponseHistory, command=com)
        if rsp:
            break
        time.sleep(1)

    rsp = [r.response for r in rsp] if hasattr(rsp, "__iter__") else ([rsp.response] if hasattr(rsp, "response") else None)

    return dict(
        detail=f"command {'received' if rsp is None else 'processed'}",
        response=rsp if rsp else "pending",
        command_id=com.command_id,
        command=com.command,
        wait=wait
    ), 200
