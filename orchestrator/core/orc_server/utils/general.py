# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import uuid


def prefixUUID(pre='PREFIX', max_length=30):
    pre = str(pre)
    uid_max = max_length - len(pre)
    uid = str(uuid.uuid4()).replace('-', '')[:uid_max]
    if pre in ['', ' ', None]:
        return f'{uid}'[:max_length]
    else:
        return f'{pre}-{uid}'[:max_length]


def to_str(val):
    if type(val) in [str, bytes]:
        return val.decode('utf-8', 'backslashreplace')
    else:
        str(val)
