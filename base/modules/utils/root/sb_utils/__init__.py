"""
Screaming Bunny Utils
Root Namespace
"""
from pkgutil import extend_path
__path__ = extend_path(__path__, __name__)

from .amqp_tools import Consumer, Producer
from .auth import Auth
from .general import toBytes, toStr, prefixUUID, default_decode, default_encode, safe_cast, safe_json
from .ext_dicts import FrozenDict, ObjectDict, QueryDict
from .message import Message, MessageType
from .serialize import SerialFormats, decode_msg, encode_msg

__all__ = [
    # Authentication
    "Auth",
    # AMQP Tools
    'Consumer',
    'Producer',
    # General Utils
    'toBytes',
    'toStr',
    'default_decode',
    'default_encode',
    'prefixUUID',
    'safe_cast',
    'safe_json',
    # Dictionaries
    'FrozenDict',
    'ObjectDict',
    'QueryDict',
    # Message Utils
    'Message',
    'MessageType',
    'SerialFormats',
    'decode_msg',
    'encode_msg'
]
