# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from .models import Device, DeviceGroup, Transport


class TransportAdmin(admin.ModelAdmin):
    list_display = ('transport_id', 'host', 'port', 'protocol', )
    filter_horizontal = ('serialization', )


class DeviceAdmin(admin.ModelAdmin):
    readonly_fields = ('device_id', )
    list_display = ('device_id', 'name', )
    filter_horizontal = ('transport', )


class DeviceGroupAdmin(admin.ModelAdmin):
    list_display = ('name', )
    filter_horizontal = ('users',)


admin.site.register(Device, DeviceAdmin)
admin.site.register(DeviceGroup, DeviceGroupAdmin)
admin.site.register(Transport, TransportAdmin)
