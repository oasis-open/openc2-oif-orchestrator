from django.db.models.query import QuerySet
from rest_framework import filters
from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet, ViewSet
from typing import Any, Dict, Tuple


class SecureViewSet(ViewSet):
    """
    Secure the viewset by permission action
    """
    action_permissions: Dict[str, Tuple[BasePermission]] = {}

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        return [perm() for perm in self.action_permissions.get(self.action, self.permission_classes)]


class SecureReadOnlyModelViewSet(ReadOnlyModelViewSet):
    """
    Secure the list and retrieve function of the requests
    """
    filter_backends = (filters.OrderingFilter,)
    action_permissions: Dict[str, Tuple[BasePermission]] = {}

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        return [perm() for perm in self.action_permissions.get(self.action, self.permission_classes)]

    def list(self, request: Request, *args, **kwargs):
        """
        Return a list of all model instances
        """
        self.pagination_class.page_size_query_param = 'length'
        self.pagination_class.max_page_size = 100
        queryset = self.secure_list(request, self.filter_queryset(self.get_queryset()))

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request: Request, *args, **kwargs):
        """
        Return a specific model instance
        """
        inst = self.get_object()
        self.secure_retrieve(request, inst)
        serializer = self.get_serializer(inst)
        return Response(serializer.data)

    # Security Functions
    def secure_list(self, request: Request, queryset: QuerySet) -> QuerySet:
        """
        Secure and filter the list queryset
        :param request: rest_framework request obj
        :param queryset: starting QuerySet
        :return: secured & filtered QuerySet
        """
        return queryset

    def secure_retrieve(self, request: Request, inst: Any) -> None:
        """
        Secure the retrieve instance
        :param request: rest_framework request obj
        :param inst: instance requested
        """


class SecureModelViewSet(ModelViewSet, SecureReadOnlyModelViewSet):
    """
    Secure the create, update, and delete function of the requests
    """
    def create(self, request: Request, *args, **kwargs):
        self.secure_create(request)
        return ModelViewSet.create(self, request, *args, **kwargs)

    def update(self, request: Request, *args, **kwargs):
        inst = self.get_object()
        self.secure_update(request, inst)
        return ModelViewSet.update(self, request, *args, **kwargs)

    def destroy(self, request: Request, *args, **kwargs):
        inst = self.get_object()
        self.secure_destroy(request, inst)
        return ModelViewSet.destroy(self, request, *args, **kwargs)

    # Security functions
    def secure_create(self, request: Request) -> None:
        """
        Secure the creation that the user has create permissions
        :param request: rest_framework request obj
        """

    def secure_update(self, request: Request, inst: Any) -> None:
        """
        Secure the update instance
        :param request: rest_framework request obj
        :param inst: instance updated
        """

    def secure_destroy(self, request: Request, inst: Any) -> None:
        """
        Secure the destroy instance
        :param request: rest_framework request obj
        :param inst: instance to destroy
        """
