from rest_framework import viewsets
from rest_framework.permissions import BasePermission
from typing import Dict, Tuple


class ViewPermissions(viewsets.GenericViewSet):
    permissions: Dict[str, Tuple[BasePermission, ...]] = {}

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        return [perm() for perm in self.permissions.get(self.action, self.permission_classes)]
