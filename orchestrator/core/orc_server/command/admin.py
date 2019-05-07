# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from .models import SentHistory, ResponseHistory


class ResponseInline(admin.TabularInline):
    model = ResponseHistory
    readonly_fields = ('command', 'received_on', 'actuator', 'response', 'received_on')


class SentHistoryAdmin(admin.ModelAdmin):
    list_display = ('command_id', 'user', 'received_on', 'command')
    filter_horizontal = ('actuators', )
    readonly_fields = ('received_on', 'actuators')
    inlines = [ResponseInline, ]


class ResponseHistoryAdmin(admin.ModelAdmin):
    list_display = ('command', 'received_on', 'actuator', 'response')

    readonly_fields = ('received_on', )


admin.site.register(SentHistory, SentHistoryAdmin)
admin.site.register(ResponseHistory, ResponseHistoryAdmin)
