# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import sys
import uuid


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


