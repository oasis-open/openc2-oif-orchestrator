# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import sys
import uuid


def prefixUUID(pre='PREFIX', max=30):
    uid_max = max - (len(pre) + 10)
    uid = str(uuid.uuid4()).replace('-', '')[:uid_max]
    return f'{pre}-{uid}'[:max]


def safe_cast(val, to_type, default=None):
    try:
        return to_type(val)
    except (ValueError, TypeError):
        return default


def to_str(s):
    """
    Convert a given type to a default string
    :param s: item to convert to a string
    :return: converted string
    """
    return s.decode(sys.getdefaultencoding(), "backslashreplace") if hasattr(s, "decode") else str(s)


