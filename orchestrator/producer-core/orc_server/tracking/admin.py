from django.contrib import admin
from .models import EventLog, RequestLog


class RequestLogAdmin(admin.ModelAdmin):
    """
    Request Log model admin
    """
    date_hierarchy = 'requested_at'
    list_display = (
        'id',
        'requested_at',
        'response_ms',
        'status_code',
        'user',
        'method',
        'path',
        'remote_addr',
        'host'
    )

    list_filter = ('method', 'status_code')
    search_fields = ('path', 'user__email',)
    raw_id_fields = ('user', )


class EventLogAdmin(admin.ModelAdmin):
    """
    Event Log model admin
    """
    date_hierarchy = 'occurred_at'
    list_display = (
        'id',
        'user',
        'occurred_at',
        'level',
        'message'
    )

    list_filter = ('level', )


# Register Models
admin.site.register(RequestLog, RequestLogAdmin)
admin.site.register(EventLog, EventLogAdmin)
