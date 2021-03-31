import atexit
import etcd
import sys

from django.apps import AppConfig
from django.conf import settings

from utils import MessageQueue
from .config import Config


class OrchestratorConfig(AppConfig):
    name = 'orchestrator'
    _FALSE_READY = (
        'runserver',
        'orchestrator.wsgi',
        'orchestrator.wsgi:application'
    )

    def ready(self):
        """
        App ready, init runtime objects
        :return: None
        """
        if all(state not in sys.argv for state in self._FALSE_READY):
            return

        from command.processors import command_response  # pylint: disable=import-outside-toplevel
        settings.MESSAGE_QUEUE = MessageQueue(**settings.QUEUE, callbacks=[command_response])
        settings.ETCD_CLIENT = etcd.Client(**settings.ETCD)
        settings.CONFIG = Config(settings.ETCD_CLIENT)


@atexit.register
def shutdown(*args, **kwargs):
    """
    App shutdown and cleanup
    :return: None
    """
    if hasattr(settings, 'MESSAGE_QUEUE') and isinstance(settings.MESSAGE_QUEUE, MessageQueue):
        settings.MESSAGE_QUEUE.shutdown()
