# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import sys

from django.apps import AppConfig

from utils import OrchestratorAPI


class WebAppConfig(AppConfig):
    name = 'webApp'
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

        '''
        orc_api = OrchestratorAPI()
        resp = orc_api.root.info()
        print(f"\n{resp.body}\n")

        resp = orc_api.root.api()
        print(f"\n{resp.body}\n")
        '''
