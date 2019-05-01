# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django import template
from django.template.defaultfilters import linebreaksbr
from django.utils.html import escape
from django.utils.safestring import mark_safe

from pprint import pformat

register = template.Library()


def var_dump(x):
    if hasattr(x, '__dict__'):
        d = dict(
            __str__=str(x),
            __unicode__=str(x).encode('utf-8', 'strict'),
            __repr__=repr(x)
        )

        d.update(x.__dict__)
        x = d

    output = f'{pformat(x)}\n'
    return output


def dump(x):
    return mark_safe(linebreaksbr(escape(var_dump(x))))


register.filter('var_dump', var_dump)
register.filter('dump', dump)
