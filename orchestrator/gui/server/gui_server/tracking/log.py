# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from . import EVENT_LEVELS
from .models import EventLog
from .settings import TRACKING

log_levels = TRACKING['EVENT_LEVELS']


def log(level=EVENT_LEVELS.Info, usr=None, msg=''):
    level = level if level in EVENT_LEVELS else EVENT_LEVELS.Info

    if level in log_levels:
        EventLog.objects.create(
            user=usr,
            level=level,
            message=msg
        )


def debug(usr=None, msg=''):
    log(EVENT_LEVELS.Debug, usr, msg)


def error(usr=None, msg=''):
    log(EVENT_LEVELS.Error, usr, msg)


def fatal(usr=None, msg=''):
    log(EVENT_LEVELS.Fatal, usr, msg)


def info(usr=None, msg=''):
    log(EVENT_LEVELS.Info, usr, msg)


def trace(usr=None, msg=''):
    log(EVENT_LEVELS.Trace, usr, msg)


def warn(usr=None, msg=''):
    log(EVENT_LEVELS.Warn, usr, msg)
