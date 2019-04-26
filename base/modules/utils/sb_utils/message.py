# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import base64
import cbor2
import collections
import json
import xmltodict
import yaml

from dicttoxml import dicttoxml

xml_root = dict(
    command='command',
    response='response'
)


def load_xml(m):
    """
    :parammg: XML Encoded message
    :type m: str
    """
    def _xml_to_dict(xml):
        tmp = {}

        for t in xml:
            if type(xml[t]) == collections.OrderedDict:
                tmp[t] = _xml_to_dict(xml[t])
            else:
                tmp[t[1:] if t.startswith("@") else t] = xml[t]

        return tmp

    if type(m) == str:
        xml_dict = _xml_to_dict(xmltodict.parse(m))
        if xml_root['command'] in xml_dict:
            return xml_dict[xml_root['command']]
        elif xml_root['response'] in xml_dict:
            return xml_dict[xml_root['response']]
        else:
            raise Exception('Cannot load message, not a command/response')

    else:
        raise Exception('Cannot load xml, improperly formatted')


serializations = dict(
    encode=dict(
        cbor=lambda x: base64.b64encode(cbor2.dumps(x)).decode('utf-8'),
        json=json.dumps,
        xml=lambda x: dicttoxml(x, custom_root=xml_root['command' if 'target' in x else 'response'], attr_type=False),
        yaml=yaml.dump
    ),
    decode=dict(
        cbor=lambda x: base64.b64decode(cbor2.loads(x)),
        json=json.loads,
        xml=load_xml,
        yaml=yaml.load
    )
)


def encode_msg(msg, enc):
    enc = enc.lower()

    if enc not in serializations['encode']:
        raise ReferenceError('Invalid Encoding')
    elif type(msg) is not dict:
        raise TypeError('Message is not type dict')

    return serializations['encode'].get(enc, serializations['encode']['json'])(msg)


def decode_msg(msg, enc):
    enc = enc.lower()

    if type(msg) is dict:
        return msg
    elif enc not in serializations['decode']:
        raise ReferenceError('Invalid Encoding')
    elif type(msg) not in [str, bytes]:
        raise TypeError('Message is not type string or bytestring')

    return serializations['decode'].get(enc, serializations['decode']['json'])(msg)
