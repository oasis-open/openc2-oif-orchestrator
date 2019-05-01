import os
import re
import socket
import uuid
from django.forms import ValidationError


from django.conf import settings

from dynamic_preferences.admin import GlobalPreferenceAdmin, PerInstancePreferenceAdmin
from dynamic_preferences.types import ChoicePreference, IntegerPreference, LongStringPreference, StringPreference
from dynamic_preferences.preferences import Section
from dynamic_preferences.registries import global_preferences_registry as global_registry

GlobalPreferenceAdmin.has_add_permission = lambda *args, **kwargs: False
GlobalPreferenceAdmin.has_delete_permission = lambda *args, **kwargs: False
PerInstancePreferenceAdmin.has_add_permission = lambda *args, **kwargs: False
PerInstancePreferenceAdmin.has_delete_permission = lambda *args, **kwargs: False

site = Section('site')
orchestrator = Section('orchestrator')


# Validation Functions
def is_valid_hostname(hostname):
    if len(hostname) > 255:
        return False
    if hostname[-1] == ".":
        hostname = hostname[:-1] # strip exactly one dot from the right, if present
    allowed = re.compile("(?!-)[A-Z\d-]{1,63}(?<!-)$", re.IGNORECASE)
    return all(allowed.match(x) for x in hostname.split("."))


def is_valid_ipv4_address(address):
    try:
        socket.inet_pton(socket.AF_INET, address)
    except AttributeError:  # no inet_pton here, sorry
        try:
            socket.inet_aton(address)
        except socket.error:
            return False
        return address.count('.') == 3
    except socket.error:  # not a valid address
        return False

    return True


def is_valid_ipv6_address(address):
    try:
        socket.inet_pton(socket.AF_INET6, address)
    except socket.error:  # not a valid address
        return False
    return True


@global_registry.register
class OrchestratorName(StringPreference):
    section = orchestrator
    name = 'name'
    help_text = 'The name of the orchestrator'
    default = 'Jazzy Ocelot'


@global_registry.register
class OrchestratorID(StringPreference):
    section = orchestrator
    name = 'id'
    help_text = 'The uuid of the orchestrator'
    default = ''

    def __init__(self, *args, **kwargs):
        super(StringPreference, self).__init__(*args, **kwargs)
        if self.default == '':
            self.default = str(uuid.uuid4())

    def validate(self, value):
        try:
            uuid.UUID(value, version=4)
        except Exception as e:
            raise e


@global_registry.register
class OrchestratorHost(StringPreference):
    section = orchestrator
    name = 'host'
    help_text = 'The hostname/ip of the orchestrator'
    _default = os.environ.get('ORC_IP', '127.0.0.1')
    default = _default if any([is_valid_hostname(_default), is_valid_ipv4_address(_default), is_valid_ipv6_address(_default)]) else '127.0.0.1'

    def validate(self, value):
        if not any([is_valid_hostname(value), is_valid_ipv4_address(value), is_valid_ipv6_address(value)]):
            raise ValidationError('The host is not a valid IPv4/IPv6/Hostname')
