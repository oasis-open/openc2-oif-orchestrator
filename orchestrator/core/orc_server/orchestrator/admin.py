from django.contrib import admin
from rest_framework.authtoken.admin import TokenAdmin

from .models import Protocol, Serialization


class ProtocolAdmin(admin.ModelAdmin):
    """
    Protocol model admin
    """
    list_display = ('name', 'pub_sub')


class SerializationAdmin(admin.ModelAdmin):
    """
    Serialization model admin
    """
    list_display = ('name', )


# Register Models
admin.site.register(Protocol, ProtocolAdmin)
admin.site.register(Serialization, SerializationAdmin)

# Update TokenAdmin Model
TokenAdmin.list_display = ('key', 'user', 'created')
TokenAdmin.readonly_fields = ('key', 'created')
TokenAdmin.list_select_related = ('user', )
