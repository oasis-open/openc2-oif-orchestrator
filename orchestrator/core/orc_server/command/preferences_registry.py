from django.forms import ValidationError

from dynamic_preferences.types import ChoicePreference, IntegerPreference, LongStringPreference, StringPreference
from dynamic_preferences.preferences import Section
from dynamic_preferences.registries import global_preferences_registry as global_registry

command = Section('command')


@global_registry.register
class CommandWait(IntegerPreference):
    section = command
    name = 'wait'
    help_text = 'The amount of time to wait, in seconds, for a response to a command (0-30 seconds)'
    default = 5

    def validate(self, value):
        if value < 0:
            raise ValidationError('Wait cannot be less than 0 seconds')
        elif value > 30:
            raise ValidationError('Wait cannot be greater than 30 seconds')
