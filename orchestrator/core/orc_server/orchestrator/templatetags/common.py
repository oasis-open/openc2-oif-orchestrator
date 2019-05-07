# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.template import Library

register = Library()


@register.simple_tag
def define(val):
    return val


@register.filter(name='split')
def spit(st, tok):
    return st.split(tok)


@register.filter(name='get_idx')
def get_idx(lst, idx):
    return lst[idx]
