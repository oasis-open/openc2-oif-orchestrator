# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django import template
from django.template.defaultfilters import linebreaksbr
from django.utils.html import escape
from django.utils.safestring import mark_safe

from pprint import pformat

register = template.Library()


@register.filter
def var_dump(var):
    """
    Dumps the value of the given object
    :param var: var to dump its value
    :return: dumped value of the given var
    """
    if hasattr(var, '__dict__'):
        d = dict(
            __str__=str(var),
            __unicode__=str(var).encode('utf-8', 'strict'),
            __repr__=repr(var)
        )

        d.update(var.__dict__)
        var = d

    output = f"{pformat(var)}\n"
    return output


@register.filter
def dump(var):
    """
    Wrapper function for var_dump
    :param var: var object to dump
    :return: dumped value of the given var
    """
    return mark_safe(linebreaksbr(escape(var_dump(var))))
