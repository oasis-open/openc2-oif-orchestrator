import atexit
import sys

from datetime import datetime
from django.apps import AppConfig
from django.conf import settings
# from elasticsearch import Elasticsearch
# from functools import partial

from utils import MessageQueue


def es_idx(g_prefs, doc_type: str) -> str:
    orc_id = g_prefs.get("orchestrator__id", "")
    return f"{orc_id}-{doc_type}_{datetime.now():%Y-%m-%d}"


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
        '''
        from dynamic_preferences.registries import global_preferences_registry
        global_preferences = global_preferences_registry.manager()
        es_host = global_preferences.get("elastic__host", "")
        if es_host:
            settings.ES_CONFIG = {
                "cmd_idx": partial(es_idx, global_preferences, "cmd"),
                "rsp_idx": partial(es_idx, global_preferences, "rsp"),
            }
            settings.ES_DB = Elasticsearch(es_host)
        '''


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
