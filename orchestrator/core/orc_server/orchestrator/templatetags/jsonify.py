# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json

from django.core.serializers import serialize
from django.db.models.query import QuerySet
from django.utils.safestring import mark_safe
from django.template import Library

register = Library()


@register.filter
def jsonify(val):
    if isinstance(val, QuerySet):
        return mark_safe(serialize('json', val))

    return mark_safe(json.dumps(val))


jsonify.is_safe = True


@register.filter
def pretty_json(val, ind=2):
    if type(val) is not dict:
        val = json.loads(val)
    return mark_safe(json.dumps(val, indent=ind))
