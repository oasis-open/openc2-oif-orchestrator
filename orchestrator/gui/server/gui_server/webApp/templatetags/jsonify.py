# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json

from django.core.serializers import serialize
from django.db.models.query import QuerySet
from django.utils.safestring import mark_safe
from django.template import Library

register = Library()


@register.filter(is_safe=True)
def jsonify(val):
    """
    JSON stringify the given value
    :param val: object to JSON stringify
    :return: stringified JSON
    """
    if isinstance(val, QuerySet):
        return mark_safe(serialize('json', val))

    return mark_safe(json.dumps(val))


@register.filter
def pretty_json(val, ind=2):
    """
    Pretty format JSON data
    :param val: Key/Value object
    :param ind: spaces to use as indent
    :return: pretty formatted key/value object
    """
    if not isinstance(val, dict):
        val = json.loads(val)
    return mark_safe(json.dumps(val, indent=ind))
