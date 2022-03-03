"""
Django Model Utilities
"""
from django.contrib import admin


def get_or_none(model, **kwargs):
    """
    Get filtered results from the given model
    :param model: model to filter
    :param kwargs: field/value to match
    :return: matching row(s) from the model
    """
    base_model = getattr(model, 'objects', model)
    qry = base_model.filter(**kwargs)
    return None if len(qry) == 0 else (qry.first() if len(qry) == 1 else qry)


class ReadOnlyModelAdmin(admin.ModelAdmin):
    """
    ModelAdmin class that prevents modifications through the admin.
    The changelist and the detail view work, but a 403 is returned if one actually tries to edit an object.
    Source: https://gist.github.com/aaugustin/1388243
    """
    actions = None

    def get_readonly_fields(self, request, obj=None):
        return self.fields or [f.name for f in self.model._meta.fields]

    def has_add_permission(self, request):
        return False

    # Allow viewing objects but not actually changing them.
    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
