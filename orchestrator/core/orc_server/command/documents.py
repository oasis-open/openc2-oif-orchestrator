from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from dynamic_preferences.registries import global_preferences_registry

from .models import SentHistory, ResponseHistory

global_preferences = global_preferences_registry.manager()
orc_name = global_preferences.get("orchestrator__name", "").lower().replace(" ", "-")


@registry.register_document
class CommandDocument(Document):
    command_id = fields.KeywordField()
    user = fields.NestedField(properties={
        'pk': fields.IntegerField(),
        'username': fields.TextField()
    })
    actuators = fields.NestedField(properties={
        'pk': fields.IntegerField(),
        'device': fields.NestedField(properties={
            'pk': fields.IntegerField(),
            'name': fields.TextField(),
        }),
        'name': fields.TextField(),
    })
    command = fields.ObjectField(properties={
        'action': fields.TextField(),
        'target': fields.ObjectField(dynamic=True),
        'args': fields.ObjectField(dynamic=True),
        'actuator': fields.ObjectField(dynamic=True),
        'command_id': fields.TextField()
    })

    class Index:
        # Name of the Elasticsearch index
        name = f"{orc_name}_commands"

        # See Elasticsearch Indices API reference for available settings
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }

    class Django:
        # The model associated with this Document
        model = SentHistory

        # The fields of the model you want to be indexed in Elasticsearch
        fields = [
            # 'command_id',
            # 'user',
            'received_on',
            # 'actuators',
            # 'command'
        ]

    def prepare_command(self, instance):
        return dict(instance.command)


@registry.register_document
class ResponseDocument(Document):
    command = fields.NestedField(properties={
        'pk': fields.IntegerField(),
        'command_id': fields.TextField()
    })
    actuator = fields.NestedField(properties={
        'pk': fields.IntegerField(),
        'device': fields.NestedField(properties={
            'pk': fields.IntegerField(),
            'name': fields.TextField(),
        }),
        'name': fields.TextField(),
    })
    response = fields.ObjectField(proerties={
        'status': fields.IntegerField(),
        'status_text': fields.TextField(),
        'results': fields.ObjectField(dynamic=True)
    })

    class Index:
        # Name of the Elasticsearch index
        name = f"{orc_name}_responses"

        # See Elasticsearch Indices API reference for available settings
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }

    class Django:
        # The model associated with this Document
        model = ResponseHistory

        # The fields of the model you want to be indexed in Elasticsearch
        fields = [
            # 'command',
            'received_on',
            # 'actuator',
            # 'response'
        ]

    def prepare_response(self, instance):
        return dict(instance.response)
