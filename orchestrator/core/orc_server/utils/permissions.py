from rest_framework import permissions


class IsAdminOrIsSelf(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Only functional for User model functions
    """

    def has_object_permission(self, request, view, obj):
        return obj == request.user or request.user.is_staff or request.user.is_superuser
