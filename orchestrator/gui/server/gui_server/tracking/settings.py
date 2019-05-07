# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings

from . import EVENT_LEVELS, REQUEST_LEVELS


_DEFAULT = {
    'URL_PREFIXES': [
        # '^/(?!admin)'  # Don't log /admin/*
        '.*'  # Log Everything
    ],
    'EVENT_LEVELS': [getattr(EVENT_LEVELS, err) for err in EVENT_LEVELS],
    'REQUEST_LEVELS': [getattr(REQUEST_LEVELS, err) for err in REQUEST_LEVELS]
}

_SETTINGS = getattr(settings, 'TRACKING', {})
TRACKING = dict()

for k in _DEFAULT:
    attr = _SETTINGS.get(k, [])

    if type(attr) not in [list, tuple]:
        TRACKING[k] = list(attr)
    elif len(attr) >= 1:
        TRACKING[k] = attr
    else:
        TRACKING[k] = _DEFAULT[k]
