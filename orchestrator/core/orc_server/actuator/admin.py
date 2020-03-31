from django.contrib import admin

# Local imports
from utils import ReadOnlyModelAdmin
from .models import Actuator, ActuatorGroup, ActuatorProfile


class ActuatorAdmin(admin.ModelAdmin):
    """
    Actuator admin
    """
    readonly_fields = ('actuator_id', 'profile', 'schema_format')
    list_display = ('name', 'device', 'profile', 'schema_format')


class ActuatorGroupAdmin(admin.ModelAdmin):
    """
    Actuator Group admin
    """
    list_display = ('name', 'user_count', 'actuator_count')
    filter_horizontal = ('users', 'actuators')


class ActuatorProfileAdmin(ReadOnlyModelAdmin, admin.ModelAdmin):
    """
    Actuator Profile admin
    """
    list_display = ('name', 'actuator_count')
    filter_horizontal = ('actuators', )

    def get_readonly_fields(self, request, obj=None):
        """
        Set name and actuator fields to read only if user is not the superuser
        :param request: request instance
        :param obj: ...
        :return: tuple - read only fields
        """
        if request.user.is_superuser:
            return ()
        return 'name', 'actuators'


# Register models
admin.site.register(Actuator, ActuatorAdmin)
admin.site.register(ActuatorGroup, ActuatorGroupAdmin)
admin.site.register(ActuatorProfile, ActuatorProfileAdmin)
