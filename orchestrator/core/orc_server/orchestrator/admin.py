from django.contrib import admin
from rest_framework.authtoken.admin import TokenAdmin

from .models import Protocol, Serialization


admin.site.register(Protocol)
admin.site.register(Serialization)

TokenAdmin.list_display = ('key', 'user', 'created')
TokenAdmin.readonly_fields = ('key', 'created')
TokenAdmin.list_select_related = ('user', )
