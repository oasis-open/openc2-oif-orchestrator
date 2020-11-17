import threading
import unittest
import uuid

from io import StringIO
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# Local imports
from actuator.models import Actuator, ActuatorSerializerReadOnly
from utils import FrozenDict
from utils.viewsets import SecureReadOnlyModelViewSet, SecureViewSet
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


class ConformanceViewSet(SecureReadOnlyModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = ConformanceTestSerializer
    lookup_field = 'test_id'

    permissions = {
        'retrieve': (IsAuthenticated,),
    }

    queryset = ConformanceTest.objects.order_by('-test_time')
    ordering_fields = ('test_id', 'actuator_tested', 'test_time', 'tests_run', 'test_results')

    # TODO: set list permissions
    # TODO: set retrieve permissions


class UnitTests(SecureViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = None  # ConformanceTestSerializer
    lookup_field = 'profile'

    action_permissions = {
        'create': (IsAuthenticated,),
        'retrieve': (IsAuthenticated,),
    }

    # Custom attributes
    unittest_Suite = load_test_suite()
    loaded_tests = tests_in_suite(unittest_Suite)

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
