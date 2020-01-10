import requests

from django.conf import settings
from django.db.models import signals, Model
from dynamic_preferences.registries import global_preferences_registry
from elasticsearch_dsl import connections, Document
from typing import Dict

global_preferences = global_preferences_registry.manager()
elastic_hooks = None
# connections.create_connection(hosts=['localhost:9200'], timeout=60)


def ElasticModel(doc: Document) -> Model:
    # print(f"doc - {doc}")
    # elastic_host = global_preferences.get("elastic__host", "").lower().replace(" ", "-")
    # elastic_host = "http://localhost:9200"
    # rsp = requests.get(elastic_host)

    # create the mappings in Elasticsearch
    # doc.init()

    def wrapper(cls: Model) -> Model:
        print(f"{cls} - {cls.__name__}")
        # settings.ELASTIC_HOOKS.add_model(cls, doc)

        return cls
    return wrapper


class ElasticHooks:
    _models: Dict[Model, Document]

    def __init__(self):
        print("ElasticHooks")
        self._models = {}

    def add_model(self, model: Model, doc: Document) -> None:
        self._models[model] = doc

        # Listen to all model saves
        signals.post_save.connect(self.handle_save, sender=model)
        signals.post_delete.connect(self.handle_delete, sender=model)

        # Use to manage related objects update
        signals.m2m_changed.connect(self.handle_m2m_changed, sender=model)

    def handle_save(self, sender, instance=None, **kwargs):
        print(f"{sender.__name__} save")

    def handle_delete(self, sender, instance=None, **kwargs):
        print(f"{sender.__name__} delete")

    def handle_m2m_changed(self, sender, instance, action, **kwargs):
        print(f"{sender.__name__} m2m change")
