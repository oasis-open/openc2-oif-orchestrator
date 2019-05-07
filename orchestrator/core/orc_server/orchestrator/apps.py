# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os
import signal
import sys

from django.apps import AppConfig
from django.conf import settings

from utils import MessageQueue


class OrchestratorConfig(AppConfig):
    name = 'orchestrator'

    def ready(self):
        print('Orchestrator Ready')
        from command.processors import command_response

        # print(sys.argv)
        if 'runserver' not in sys.argv and 'orchestrator.wsgi' not in sys.argv:
            return True

        print(f'Configuring Queue Subscription')
        settings.MESSAGE_QUEUE = MessageQueue(**settings.QUEUE, callbacks=[command_response])


def shutdown(signal, frame):
    if os.environ.get('RUN_MAIN') == 'true':
        print('STOPPED')

    if type(settings.MESSAGE_QUEUE) is MessageQueue:
        settings.MESSAGE_QUEUE.shutdown()

    exit(signal)


signal.signal(signal.SIGINT, shutdown)

