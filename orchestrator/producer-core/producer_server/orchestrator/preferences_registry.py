import ipaddress
import os
import re
import uuid

from django.conf import settings
from django.forms import ValidationError
from dynamic_preferences.admin import GlobalPreferenceAdmin, PerInstancePreferenceAdmin
from dynamic_preferences.types import StringPreference
from dynamic_preferences.preferences import Section
from dynamic_preferences.registries import global_preferences_registry as global_registry

GlobalPreferenceAdmin.has_add_permission = lambda *args, **kwargs: False
GlobalPreferenceAdmin.has_delete_permission = lambda *args, **kwargs: False
PerInstancePreferenceAdmin.has_add_permission = lambda *args, **kwargs: False
PerInstancePreferenceAdmin.has_delete_permission = lambda *args, **kwargs: False

orchestrator = Section("orchestrator")


# Validation Functions
def is_valid_hostname(hostname):
    """
    Validate a hostname
    :param hostname: hostname to validate
    :return: bool - valid hostname
    """
    if len(hostname) > 255:
        return False
    if hostname[-1] == ".":
        hostname = hostname[:-1]  # strip exactly one dot from the right, if present
    allowed = re.compile(r"(?!-)[A-Z\d-]{1,63}(?<!-)$", re.IGNORECASE)
    return all(allowed.match(x) for x in hostname.split("."))


def is_valid_ipv4_address(address):
    """
    Validate an IPv4 Address
    :param address: IP Address to validate
    :return: bool - valid address
    """
    try:
        ipaddress.IPv4Address(address)
    except ValueError:  # not a valid address
        return False
    return True


def is_valid_ipv6_address(address):
    """
    Validate an IPv6 Address
    :param address: IP Address to validate
    :return: bool - valid address
    """
    try:
        ipaddress.IPv6Address(address)
    except ValueError:  # not a valid address
        return False
    return True


# Orchestrator section
@global_registry.register
class OrchestratorName(StringPreference):
    """
    Dynamic Preference for Orchestrator Name
    """
    section = orchestrator
    name = "name"
    help_text = "The name of the orchestrator"
    default = "Jazzy Ocelot"


@global_registry.register
class OrchestratorID(StringPreference):
    """
    Dynamic Preference for Orchestrator ID
    """
    section = orchestrator
    name = "id"
    help_text = "The uuid of the orchestrator"
    default = str(settings.CONFIG.OrchestratorID) if hasattr(settings, "CONFIG") else ""

    def validate(self, value):
        """
        Validate the ID when updated
        :param value: new value to validate
        :return: None/exception
        """
        try:
            uuid.UUID(value, version=4)
        except Exception as e:
            raise ValidationError(str(e))


@global_registry.register
class OrchestratorHost(StringPreference):
    """
    Dynamic Preference for Orchestrator Hostname/IP
    """
    section = orchestrator
    name = "host"
    help_text = "The hostname/ip of the orchestrator"
    _default = os.environ.get("ORC_IP", "127.0.0.1")
    _val_host_addr = any([is_valid_hostname(_default), is_valid_ipv4_address(_default), is_valid_ipv6_address(_default)])
    default = _default if _val_host_addr else "127.0.0.1"

    def validate(self, value):
        """
        Validate the Hostname/IP when updated
        :param value: new value to validate
        :return: None/exception
        """
        if not any([is_valid_hostname(value), is_valid_ipv4_address(value), is_valid_ipv6_address(value)]):
            raise ValidationError("The host is not a valid Hostname/IPv4/IPv6")
