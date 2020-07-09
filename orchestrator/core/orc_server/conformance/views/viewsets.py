import threading
import unittest
import uuid

from io import StringIO
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import viewsets, filters
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# Local imports
from actuator.models import Actuator, ActuatorSerializerReadOnly
from utils import FrozenDict
from ..models import ConformanceTest, ConformanceTestSerializer
from ..tests import get_tests, load_test_suite, tests_in_suite, TestResults


def test_thread(test_suite, db_test):
    test_log = StringIO()
    results = unittest.TextTestRunner(
        stream=test_log,
        failfast=False,
        resultclass=TestResults
    ).run(test_suite)

    db_test.test_results = results.getReport(verbose=True)
    db_test.save()


def toFrozen(o) -> FrozenDict:
    if isinstance(o, dict):
        return FrozenDict({k: toFrozen(v) for k, v in o.items()})
    if isinstance(o, list):
        return tuple(map(toFrozen, o))
    return o


class ConformanceViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = ConformanceTestSerializer
    lookup_field = 'test_id'

    permissions = {
        'retrieve': (IsAuthenticated,),
    }

    queryset = ConformanceTest.objects.order_by('-test_time')
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ('test_id', 'actuator_tested', 'test_time', 'tests_run', 'test_results')

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        return [permission() for permission in self.permissions.get(self.action, self.permission_classes)]

    def list(self, request, *args, **kwargs):
        """
        Return a list of all conformance tests that the user has executed, all tests if admin
        """
        self.pagination_class.page_size_query_param = 'length'
        self.pagination_class.max_page_size = 100
        queryset = self.filter_queryset(self.get_queryset())

        # if not request.user.is_staff:  # Standard User
        #     queryset = queryset.filter(user=request.user)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Return a specific conformance test that the user has executed, any test if admin
        """
        command = self.get_object()

        # if not request.user.is_staff:  # Standard User
        #     if command.user is not request.user:
        #         raise PermissionDenied(detail='User not authorised to access command', code=401)

        serializer = self.get_serializer(command)
        return Response(serializer.data)


class UnitTests(viewsets.ViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = None  # ConformanceTestSerializer
    lookup_field = 'profile'

    permissions = {
        'create': (IsAuthenticated,),
        'retrieve': (IsAuthenticated,),
    }

    # Custom attributes
    unittest_Suite = load_test_suite()
    loaded_tests = tests_in_suite(unittest_Suite)

    # Override methods
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        return [permission() for permission in self.permissions.get(self.action, self.permission_classes)]

    # View methods
    def create(self, request, *args, **kwargs):
        """
        Create and run a new conformance test based on the given tests
        """
        actuator = request.data.get('actuator', None)
        try:
            uuid.UUID(actuator, version=4)
            actuator = Actuator.objects.get(actuator_id=actuator)
        except (ObjectDoesNotExist, ValueError):
            raise NotFound("Actuator uuid not valid/found")

        act = toFrozen(ActuatorSerializerReadOnly(actuator).data)
        testSuite = get_tests(self.unittest_Suite, request.data.get('tests', {}), actuator=act)
        test = ConformanceTest(
            actuator_tested=actuator,
            tests_run=tests_in_suite(testSuite)
        )
        test.save()
        threading.Thread(target=test_thread, args=(testSuite, test)).start()

        return Response(ConformanceTestSerializer(test).data)

    def list(self, request, *args, **kwargs):
        """
        Return a list of all conformance tests that the user has executed, all tests if admin
        """
        return Response(tests_in_suite(self.unittest_Suite))

    def retrieve(self, request, *args, **kwargs):
        """
        Return specific conformance tests given the profile specified
        """
        return Response(self.loaded_tests.get(kwargs['profile'], {}))
