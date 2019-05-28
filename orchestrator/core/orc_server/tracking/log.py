# -*- coding: utf-8 -*-
from __future__ import unicode_literals


from . import EVENT_LEVELS, LEVEL_EVENTS
from .conf import settings, TrackingConfig
from .models import EventLog


def log(level=EVENT_LEVELS.Info, usr=None, msg=''):
    """
    Log a message at the specified level
    :param level: level of the error
    :param usr: user that caused the message
    :param msg: message to log
    :return: None
    """
    level = level if level in EVENT_LEVELS else EVENT_LEVELS.Info
    usr = None if getattr(usr, 'is_anonymous', True) else usr

    if level in getattr(settings, f"{TrackingConfig.Meta.prefix}_EVENT_LEVELS"):
        print(f"{LEVEL_EVENTS.get(level, '')} Log: {usr} - {msg}")
        EventLog.objects.create(
            user=usr,
            level=level,
            message=msg
        )


def debug(usr=None, msg=''):
    """
    Log debug message
    :param usr: user that caused the message
    :param msg: message to log
    :return: None
    """
    log(EVENT_LEVELS.Debug, usr, msg)


def error(usr=None, msg=''):
    """
    Log error message
    :param usr: user that caused the message
    :param msg: message to log
    :return: None
    """
    log(EVENT_LEVELS.Error, usr, msg)


def fatal(usr=None, msg=''):
    """
    Log fatal message
    :param usr: user that caused the message
    :param msg: message to log
    :return: None
    """
    log(EVENT_LEVELS.Fatal, usr, msg)


def info(usr=None, msg=''):
    """
    Log info message
    :param usr: user that caused the message
    :param msg: message to log
    :return: None
    """
    log(EVENT_LEVELS.Info, usr, msg)


def trace(usr=None, msg=''):
    """
    Log trace message
    :param usr: user that caused the message
    :param msg: message to log
    :return: None
    """
    log(EVENT_LEVELS.Trace, usr, msg)


def warn(usr=None, msg=''):
    """
    Log warning message
    :param usr: user that caused the message
    :param msg: message to log
    :return: None
    """
    log(EVENT_LEVELS.Warn, usr, msg)
