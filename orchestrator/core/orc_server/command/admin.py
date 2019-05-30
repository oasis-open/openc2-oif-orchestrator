from django.contrib import admin

from .models import SentHistory, ResponseHistory


class ResponseInline(admin.TabularInline):
    """
    Command Response InLine admin
    """
    model = ResponseHistory
    readonly_fields = ('command', 'received_on', 'actuator', 'response', 'received_on')


class SentHistoryAdmin(admin.ModelAdmin):
    """
    Command Sent admin
    """
    list_display = ('command_id', '_coap_id', 'user', 'received_on', 'command')
    filter_horizontal = ('actuators', )
    readonly_fields = ('received_on', 'actuators')
    inlines = [ResponseInline, ]


class ResponseHistoryAdmin(admin.ModelAdmin):
    """
    Command Response admin
    """
    list_display = ('command', 'received_on', 'actuator', 'response')
    readonly_fields = ('received_on', )


# Register models
admin.site.register(SentHistory, SentHistoryAdmin)
admin.site.register(ResponseHistory, ResponseHistoryAdmin)
