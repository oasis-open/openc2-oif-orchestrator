"""
Message Conversion functions
"""
import base64
import bson
import cbor2
import edn_format
import json
import msgpack
import toml
import ubjson
import yaml

from typing import Union
from amazon.ion import simpleion as ion
from . import enums, helpers, pybinn, pysmile
from .. import ext_dicts, general

try:
    from yaml import CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import Loader, Dumper


serializations = ext_dicts.FrozenDict(
    encode=ext_dicts.FrozenDict(
        binn=pybinn.dumps,
        bencode=helpers.bencode_encode,
        bson=bson.dumps,
        cbor=cbor2.dumps,
        edn=edn_format.dumps,
        json=json.dumps,
        ion=lambda m: ion.dumps(m, binary=True),
        msgpack=lambda m: msgpack.packb(m, use_bin_type=True),
        sexp=helpers.sp_encode,  # S-Expression
        smile=pysmile.encode,
        toml=toml.dumps,
        xml=helpers.xml_encode,
        ubjson=ubjson.dumpb,
        vpack=helpers.vpack_encode,
        yaml=lambda m: yaml.dump(m, Dumper=Dumper)
    ),
    decode=ext_dicts.FrozenDict(
        binn=pybinn.loads,
        bencode=helpers.bencode_decode,
        bson=bson.loads,
        cbor=cbor2.loads,
        edn=edn_format.loads,
        json=json.loads,
        ion=ion.loads,
        msgpack=msgpack.unpackb,
        sexp=helpers.sp_decode,  # S-Expression
        smile=pysmile.decode,
        toml=toml.loads,
        xml=helpers.xml_decode,
        ubjson=ubjson.loadb,
        vpack=helpers.vpack_decode,
        yaml=lambda m: yaml.load(m, Loader=Loader)
    )
)


def encode_msg(msg: dict, enc: enums.SerialFormats = enums.SerialFormats.JSON, raw: bool = False) -> Union[bytes, str]:
    """
    Encode the given message using the serialization specified
    :param msg: message to encode
    :param enc: serialization to encode
    :param raw: message is in raw form (bytes/string) or safe string (base64 bytes as string)
    :return: encoded message
    """
    if not isinstance(msg, dict):
        raise TypeError(f"Message is not expected type {dict}, got {type(msg)}")

    msg = general.default_encode(msg)
    if len(msg.keys()) == 0:
        raise KeyError("Message should have at minimum one key")

    enc = (enc if isinstance(enc, str) else enc.value).lower()
    if encoder := serializations.encode.get(enc):
        encoded = encoder(msg)
        if raw:
            return encoded
        return base64.b64encode(encoded).decode("utf-8") if isinstance(encoded, bytes) else encoded
    raise ReferenceError(f"Invalid encoding `{enc}` specified, must be one of {', '.join(serializations.encode.keys())}")


def decode_msg(msg: Union[bytes, str], enc: enums.SerialFormats, raw: bool = False) -> dict:
    """
    Decode the given message using the serialization specified
    :param msg: message to decode
    :param enc: serialization to decode
    :param raw: message is in raw form (bytes/string) or safe string (base64 bytes as string)
    :return: decoded message
    """
    if isinstance(msg, dict):
        return msg

    if not isinstance(msg, (bytes, str)):
        raise TypeError(f"Message is not expected type {bytes}/{str}, got {type(msg)}")

    if not raw and general.isBase64(msg):
        msg = base64.b64decode(msg if isinstance(msg, bytes) else msg.encode())

    enc = enc.lower() if isinstance(enc, str) else enc.value
    if decoder := serializations.decode.get(enc):
        msg = decoder(msg)
        return general.default_encode(msg, {bytes: bytes.decode})
    raise ReferenceError(f"Invalid encoding `{enc}` specified, must be one of {', '.join(serializations.decode.keys())}")
