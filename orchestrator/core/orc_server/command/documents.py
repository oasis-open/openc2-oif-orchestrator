from es_mirror.field import (
    Date,
    Integer,
    Nested,
    Object,
    Text
)

from es_mirror.document import Document, InnerDoc


class UserDocument(InnerDoc):
    username = Text()
    email = Text()


class DeviceDocument(InnerDoc):
    name = Text()
    device_id = Text()


class ActuatorDocument(InnerDoc):
    name = Text()
    actuator_id = Text()
    device = Object(DeviceDocument)


class OpenC2_CommandDocument(InnerDoc):
    action = Text()
    target = Object(dynamic=True)
    args = Object(dynamic=True)
    actuator = Object(dynamic=True)
    command_id = Text()


class OpenC2_ResponseDocument(InnerDoc):
    status = Integer()
    status_text = Text()
    results = Object(dynamic=True)


class CommandDocument(Document):
    command_id = Text()
    user = Object(UserDocument)
    received_on = Date(default_timezone='UTC')
    actuators = Nested(ActuatorDocument)
    command = Object(OpenC2_CommandDocument)

    class Index:
        name = 'commands'

        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }


class ResponseDocument(Document):
    command = Text()
    received_on = Date(default_timezone='UTC')
    actuator = Object(ActuatorDocument)
    response = Object(OpenC2_ResponseDocument)

    class Index:
        name = 'responses'

        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }

    def prepare_command(self, instance):
        return instance.command.command_id
