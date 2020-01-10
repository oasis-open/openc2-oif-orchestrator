from django_elasticsearch_dsl import fields, Document, InnerDoc, Nested, Object
from dynamic_preferences.registries import global_preferences_registry

global_preferences = global_preferences_registry.manager()


class Actuator(InnerDoc):
    name = fields.TextField(),
    actuator_id = fields.TextField(),
    device = fields.ObjectField(properties={
        'name': fields.TextField(),
        'device_id': fields.TextField(),
    })


class CommandDocument(Document):
    command_id = fields.TextField()
    user = fields.ObjectField(properties={
        'username': fields.TextField(),
        'email': fields.TextField()
    })
    received_on = fields.DateField()
    actuators = Nested(Actuator)
    command = fields.ObjectField(properties={
        'action': fields.TextField(),
        'target': fields.ObjectField(dynamic=True),
        'args': fields.ObjectField(dynamic=True),
        'actuator': fields.ObjectField(dynamic=True),
        'command_id': fields.TextField()
    })

    class Index:
        @property
        def name(self):
            # Name of the Elasticsearch index
            _orc_name = global_preferences.get("orchestrator__name", "").lower().replace(" ", "-")
            return f"{_orc_name}_commands"

    # def prepare_received_on(self, instance):
    #     return int(instance.received_on.timestamp())

    def prepare_command(self, instance):
        return dict(instance.command)


class ResponseDocument(Document):
    command = fields.TextField()
    received_on = fields.DateField()
    actuator = Object(Actuator)
    response = fields.ObjectField(properties={
        'status': fields.IntegerField(),
        'status_text': fields.TextField(),
        'results': fields.ObjectField(dynamic=True)
    })

    class Index:
        @property
        def name(self):
            # Name of the Elasticsearch index
            _orc_name = global_preferences.get("orchestrator__name", "").lower().replace(" ", "-")
            return f"{_orc_name}_responses"

    def prepare_command(self, instance):
        return str(instance.command.command_id)

    # def prepare_received_on(self, instance):
    #     return int(instance.received_on.timestamp())

    def prepare_response(self, instance):
        return dict(instance.response)
