from django.contrib import admin
from polymorphic.admin import PolymorphicParentModelAdmin, PolymorphicChildModelAdmin, PolymorphicChildModelFilter
from polymorphic.admin import PolymorphicInlineSupportMixin, StackedPolymorphicInline

from .models import Device, DeviceGroup
from .models.transports import (
    # Base
    Transport,
    TransportAuth,
    # Transport Specific
    TransportMQTT
)


# Polymorphic Transport Models
class TransportSharedOptions:
    # Standard Options
    list_display = ('transport_id', 'host', 'port', 'protocol', )
    filter_horizontal = ('serialization', )


class TransportChildAdmin(TransportSharedOptions, PolymorphicChildModelAdmin):
    """ Base admin class for all child models """
    base_model = Transport  # Optional, explicitly set here.


@admin.register(TransportAuth)
class TransportAuthAdmin(TransportChildAdmin):
    base_model = TransportAuth


@admin.register(TransportMQTT)
class TransportMQTTAdmin(TransportChildAdmin):
    base_model = TransportMQTT


@admin.register(Transport)
class TransportParentAdmin(TransportSharedOptions, PolymorphicParentModelAdmin):
    """
    Transport model admin
    """
    # Polymorphic Options
    base_model = Transport  # Optional, explicitly set here.
    child_models = (Transport, TransportAuth, TransportMQTT)
    list_filter = (PolymorphicChildModelFilter, )


# Device Models
@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    """
    Device model admin
    """
    readonly_fields = ('device_id', )
    list_display = ('device_id', 'name', )
    filter_horizontal = ('transport', )


@admin.register(DeviceGroup)
class DeviceGroupAdmin(admin.ModelAdmin):
    """
    Device Group model admin
    """
    list_display = ('name', )
    filter_horizontal = ('users', 'devices')
