# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from .models import Device, DeviceGroup, Transport


class TransportAdmin(admin.ModelAdmin):
    """
    Transport model admin
    """
    list_display = ('transport_id', 'host', 'port', 'protocol', )
    filter_horizontal = ('serialization', )


class DeviceAdmin(admin.ModelAdmin):
    """
    Device model admin
    """
    readonly_fields = ('device_id', )
    list_display = ('device_id', 'name', )
    filter_horizontal = ('transport',)


class DeviceGroupAdmin(admin.ModelAdmin):
    """
    Device Group model admin
    """
    list_display = ('name', )
    filter_horizontal = ('users', 'devices')


# Register models
admin.site.register(Device, DeviceAdmin)
admin.site.register(DeviceGroup, DeviceGroupAdmin)
admin.site.register(Transport, TransportAdmin)
