from django.db.models import Model
from elasticsearch_dsl import connections, Document, Search

from .apps import ES_Hooks


def ElasticModel(doc: Document) -> Model:
    def wrapper(model: Model) -> Model:
        if ES_Hooks:
            ES_Hooks.add_model(model, doc)

        return model
    return wrapper
