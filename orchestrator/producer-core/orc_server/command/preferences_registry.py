from django.forms import ValidationError
from dynamic_preferences.types import IntegerPreference
from dynamic_preferences.preferences import Section
from dynamic_preferences.registries import global_preferences_registry as global_registry

command = Section('command')


@global_registry.register
class CommandWait(IntegerPreference):
    """
    Dynamic Preference for Command wait time
    Time before checking the database after sending a command for a response
    """
    section = command
    name = 'wait'
    help_text = 'The amount of time to wait, in seconds, for a response to a command (0-30 seconds)'
    default = 5

    def validate(self, value):
        """
        Validate the wait time when updated
        :param value: new value to validate
        :return: None/exception
        """
        if value < 0:
            raise ValidationError('Wait cannot be less than 0 seconds')

        if value > 30:
            raise ValidationError('Wait cannot be greater than 30 seconds')
