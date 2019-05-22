# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import atexit
import sys

from django.apps import AppConfig
from django.conf import settings

from utils import MessageQueue


class OrchestratorConfig(AppConfig):
    name = 'orchestrator'
    _FALSE_READY = (
        'runserver',
        'orchestrator.wsgi',
        'uwsgi'
    )

    def ready(self):
        """
        App ready, init runtime objects
        :return: None
        """
        if all(state not in sys.argv for state in self._FALSE_READY):
            return

        from command.processors import command_response
        settings.MESSAGE_QUEUE = MessageQueue(**settings.QUEUE, callbacks=[command_response])


@atexit.register
def shutdown(*args, **kwargs):
    """
    App shutdown and cleanup
    :return: None
    """

    if type(settings.MESSAGE_QUEUE) is MessageQueue:
        settings.MESSAGE_QUEUE.shutdown()

    try:
        import uwsgi
        print(f"worker {uwsgi.worker_id()} has passed")
    except ModuleNotFoundError:
        pass
