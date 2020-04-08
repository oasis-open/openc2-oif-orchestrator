"""
Message Conversion functions
"""
import base64
import bson
import cbor2
import json
import msgpack
import shutil
import ubjson
import yaml

from typing import Union

from .. import (
    ext_dicts,
    general
)

from . import (
    pybinn,
    pysmile,
    s_expression,
    xml
)


try:
    from yaml import CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import Loader, Dumper

optionals = dict(
    encode={},
    decode={}
)

if shutil.which("json-to-vpack") and shutil.which("vpack-to-json"):
    from . import vpack
    optionals["encode"]["vpack"] = lambda v: vpack.encode(v)
    optionals["decode"]["vpack"] = lambda v: vpack.decode(v)


serializations = ext_dicts.FrozenDict(
    encode=ext_dicts.FrozenDict(
        binn=lambda v: pybinn.dumps(v),
        bson=lambda v: bson.dumps(v),
        cbor=lambda v: cbor2.dumps(v),
        json=lambda v: json.dumps(v),
        msgpack=lambda v: msgpack.packb(v, use_bin_type=True),
        s_expression=lambda v: s_expression.encode(v),
        # smile=lambda v: pysmile.encode(v),
        xml=lambda v: xml.encode(v),
        ubjson=lambda v: ubjson.dumpb(v),
        yaml=lambda v: yaml.dump(v, Dumper=Dumper),
        **optionals["encode"]
    ),
    decode=ext_dicts.FrozenDict(
        binn=lambda v: pybinn.loads(v),
        bson=lambda v: bson.loads(v),
        cbor=lambda v: cbor2.loads(v),
        json=lambda v: json.loads(v),
        msgpack=lambda v: msgpack.unpackb(v),
        s_expression=lambda v: s_expression.decode(v),
        # smile=lambda v: pysmile.decode(v),
        xml=lambda v: xml.decode(v),
        ubjson=lambda v: ubjson.loadb(v),
        yaml=lambda v: yaml.load(v, Loader=Loader),
        **optionals["decode"]
    )
)

del optionals


def encode_msg(msg: dict, enc: str, raw: bool = False) -> Union[bytes, str]:
    """
    Encode the given message using the serialization specified
    :param msg: message to encode
    :param enc: serialization to encode
    :param raw: message is in raw form (bytes/string) or safe string (base64 bytes as string)
    :return: encoded message
    """
    enc = enc.lower()
    msg = general.default_encode(msg)

    if enc not in serializations.encode:
        raise ReferenceError(f"Invalid encoding specified, must be one of {', '.join(serializations.encode.keys())}")

    if not isinstance(msg, dict):
        raise TypeError(f"Message is not expected type {dict}, got {type(msg)}")

    if len(msg.keys()) == 0:
        raise KeyError("Message should have at minimum one key")

    encoded = serializations["encode"].get(enc, serializations.encode["json"])(msg)
    if raw:
        return encoded
    return base64.b64encode(encoded).decode("utf-8") if isinstance(encoded, bytes) else encoded


def decode_msg(msg: Union[bytes, str], enc: str, raw: bool = False) -> dict:
    """
    Decode the given message using the serialization specified
    :param msg: message to decode
    :param enc: serialization to decode
    :param raw: message is in raw form (bytes/string) or safe string (base64 bytes as string)
    :return: decoded message
    """
    enc = enc.lower()

    if isinstance(msg, dict):
        return msg

    if enc not in serializations.decode:
        raise ReferenceError(f"Invalid encoding specified, must be one of {', '.join(serializations.decode.keys())}")

    if not isinstance(msg, (bytes, bytearray, str)):
        raise TypeError(f"Message is not expected type {bytes}/{bytearray}/{str}, got {type(msg)}")

    if not raw and general.isBase64(msg):
        msg = base64.b64decode(msg if isinstance(msg, bytes) else msg.encode())

    msg = serializations["decode"].get(enc, serializations.decode["json"])(msg)
    return general.default_encode(msg, {bytes: bytes.decode})
