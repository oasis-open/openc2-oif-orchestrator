from django.apps import AppConfig

from .settings import SETTINGS
from .utils import ElasticHooks


ES_Hooks = ElasticHooks(**SETTINGS)


class EsMirrorConfig(AppConfig):
    name = 'es_mirror'
    verbose_name = 'Elasticsearch Mirror'
