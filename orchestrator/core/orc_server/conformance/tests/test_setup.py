"""
Conformance Test Setup
"""
import unittest

# Local imports
from sb_utils import FrozenDict


class SetupTestSuite(unittest.TestSuite):
    """
    Basic OpenC2 TestSuite Class
    """
    _testKwargs: dict

    def __init__(self, tests: tuple = (), **kwargs):
        super().__init__(tests=tests)
        self._testKwargs = kwargs

    def run(self, result, debug=False):
        topLevel = False
        if getattr(result, '_testRunEntered', False) is False:
            result._testRunEntered = topLevel = True

        for index, test in enumerate(self):
            if result.shouldStop:
                break

            if unittest.suite._isnotsuite(test):
                self._tearDownPreviousClass(test, result)
                self._handleModuleFixture(test, result)
                self._handleClassSetUp(test, result)
                result._previousTestClass = test.__class__

                if (getattr(test.__class__, '_classSetupFailed', False) or getattr(result, '_moduleSetUpFailed', False)):
                    continue

            if not debug:
                test(result, **self._testKwargs)
            else:
                test.debug(**self._testKwargs)

            if self._cleanup:
                self._removeTestAtIndex(index)

        if topLevel:
            self._tearDownPreviousClass(None, result)
            self._handleModuleTearDown(result)
            result._testRunEntered = False
        return result


class SetupTestCase(unittest.TestCase):
    """
    OpenC2 TestCase setup class
    """
    actuator: FrozenDict
    '''
    FrozenDict - immutable dictionary with object like attribute access
    Actuator: FrozenDict[
        actuator_id: UUIDv4
        name: str
        device: FrozenDict[
            device_id: UUIDv3
            name: str
            transport: Tuple[
                FrozenDict[
                    transport_id: str,
                    host: str
                    port: int
                    protocol: str
                    serialization: List[str]
                    topic: str
                    channel: str
                    pub_sub: bool
                ]
            ]
            nodes: str
        ]
        schema: FrozenDict
        profile: str
    ]
    '''
    profile: str = None

    def __init__(self, methodName: str = 'runTest', **kwargs):
        super().__init__(methodName=methodName)
        self._setupKwargs(**kwargs)

    def _setupKwargs(self, **kwargs):
        self.actuator = kwargs.get('actuator', None)

    def debug(self, **kwargs):  # pylint: disable=arguments-differ
        self._setupKwargs(**kwargs)
        super().debug()

    def __call__(self, *args, **kwargs):
        self._setupKwargs(**kwargs)
        return self.run(*args)
