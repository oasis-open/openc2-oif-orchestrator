import random

from actuator.models import Actuator
from tracking import log

from .models import SentHistory, ResponseHistory

from orchestrator.models import Protocol
from utils import decode_msg, get_or_none, isHex, safe_cast


def command_response(body, message):
    """
    Process a command received from an actuator
    :param body: command body
    :param message: complete message (headers, meta, ...)
    :return: None
    """
    log.info(msg=f'Message response received: {body}')
    headers = getattr(message, "headers", {})
    actuator = None

    if headers.get('error', False):
        correlation_ID = headers['source'].get('correlationID', '')
        opts = {
            '_coap_id' if isHex(correlation_ID) else 'command_id': correlation_ID
        }

        command = get_or_none(SentHistory, **opts)
        log.error(msg=f'Message Failure: cmd - {command.command_id}, {body}')

        response = {
            'error': body
        }

    else:
        act_host, act_port = headers.get('socket', '').split(':')[0:2]
        correlation_ID = headers.get('correlationID', '')
        opts = {
            '_coap_id' if isHex(correlation_ID) else 'command_id': correlation_ID
        }

        command = get_or_none(SentHistory, **opts)
        profile = headers.get('profile', '')

        encode = headers.get('encode', 'json')
        response = decode_msg(body, encode)

        actuator = get_or_none(
            model=Actuator,
            profile__iexact=profile,
            device__transport__host__iexact=act_host,
            device__transport__port=safe_cast(act_port, int),
            device__transport__protocol=get_or_none(Protocol, name__iexact=headers.get('transport', ''))
        )

        if hasattr(actuator, '__iter__'):
            log.warn(msg=f'Multiple actuators match for command response - {command.command_id}')
            actuator = random.choice(actuator)

    try:
        cmd_rsp = ResponseHistory(command=command, actuator=actuator, response=response)
        cmd_rsp.save()
    except Exception as e:
        log.error(msg=f'Message response failed to save: {e}')
