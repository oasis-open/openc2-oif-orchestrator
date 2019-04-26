# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.apps import AppConfig

from utils import OrchestratorAPI


class WebAppConfig(AppConfig):
    name = 'webApp'

    def ready(self):
        """
        App ready, init runtime objects
        :return: None
        """
        '''
        orc_api = OrchestratorAPI()
        resp = orc_api.root.info()
        print(f"\n{resp.body}\n")

        resp = orc_api.root.api()
        print(f"\n{resp.body}\n")
        '''
