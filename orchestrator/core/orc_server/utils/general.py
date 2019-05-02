# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import random
import string
import sys
import uuid

valid_hex = set(string.hexdigits)
valid_hex.add(" ")


def prefixUUID(pre="PREFIX", max_length=30):
    """
    Create a unique name with a prefix and a UUID string
    :param pre: prefix to use
    :param max_length: max length of the unique name
    :return: unique name with the given prefix
    """
    pre = str(pre)
    uid_max = max_length - len(pre)
    uid = str(uuid.uuid4()).replace("-", "")[:uid_max]
    if pre in ["", " ", None]:
        return f"{uid}"[:max_length]
    else:
        return f"{pre}-{uid}"[:max_length]


def to_str(s):
    """
    Convert a given type to a default string
    :param s: item to convert to a string
    :return: converted string
    """
    return s.decode(sys.getdefaultencoding(), "backslashreplace") if hasattr(s, "decode") else str(s)


def randBytes(b=2):
    """
    Get a random number of bytes
    :param b: number of bytes generate
    :return: random number of bytes requested
    """
    return bytes([random.getrandbits(8) for _ in range(b)])


def isHex(val):
    val = ''.join(val.split("0x"))
    return len(set(val) - valid_hex) == 0