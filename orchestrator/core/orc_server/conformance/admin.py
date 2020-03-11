from django.contrib import admin

from .models import ConformanceTest


class ConformanceTestAdmin(admin.ModelAdmin):
    """
    ConformanceTest admin
    """
    list_display = ('test_id', 'actuator_tested', 'test_time')
    readonly_fields = ('test_id', 'actuator_tested', 'test_time', 'tests_run', 'test_results')


# Register models
admin.site.register(ConformanceTest, ConformanceTestAdmin)
