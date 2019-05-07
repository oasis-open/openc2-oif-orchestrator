# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from .models import Actuator, ActuatorGroup, ActuatorProfile

from utils import ReadOnlyModelAdmin


class ActuatorAdmin(admin.ModelAdmin):
    readonly_fields = ('actuator_id', 'profile')
    list_display = ('name', 'device', 'profile')


class ActuatorGroupAdmin(admin.ModelAdmin):
    list_display = ('name', )
    filter_horizontal = ('users',)


class ActuatorProfileAdmin(ReadOnlyModelAdmin, admin.ModelAdmin):
    list_display = ('name', )
    filter_horizontal = ('actuators', )

    def get_readonly_fields(self, request, obj=None):
        if request.user.is_superuser:
            return ()
        else:
            return 'name', 'actuators'


admin.site.register(Actuator, ActuatorAdmin)
admin.site.register(ActuatorGroup, ActuatorGroupAdmin)
admin.site.register(ActuatorProfile, ActuatorProfileAdmin)
