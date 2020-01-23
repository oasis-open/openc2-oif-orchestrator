# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.template import Library

register = Library()


@register.simple_tag
def define(val):
    """
    Dynamically define a variable within a template
    :param val: value to assign
    :return: value
    """
    return val


@register.filter(name='split')
def spit(st, tok):
    """
    Split a the given string at the given toekn
    :param st: string to split
    :param tok: token to split at
    :return: split string
    """
    return st.split(tok)


@register.filter(name='get_idx')
def get_idx(lst, idx):
    """
    get the item at the given index
    :param lst: iterative object
    :param idx: index to get the item
    :return: item at hte given index
    """
    return lst[idx]
