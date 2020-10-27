from django.contrib import admin
from .models import Orchestrator, OrchestratorAuth

# Register your models here.


class OrchestratorAdmin(admin.ModelAdmin):
    list_display = (
        'orc_id',
        'name',
        'proto',
        'host',
        'port',
    )


class OrchestratorAuthAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'token',
        'orchestrator'
    )


admin.site.register(Orchestrator, OrchestratorAdmin)
admin.site.register(OrchestratorAuth, OrchestratorAuthAdmin)
