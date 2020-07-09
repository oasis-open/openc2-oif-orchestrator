"""
Unittest Utilities
"""
import inspect
import os
import unittest

from typing import (
    Dict,
    List,
    Tuple,
    Union
)

from .test_setup import SetupTestSuite, SetupTestCase  # pylint: disable=import-error

test_dirs = [
    os.path.dirname(os.path.realpath(__file__)),  # Local Dir
    # "./tests"  # Custom Dir
]


def inherits_from(child, parents: Union[Tuple[type, ...], type]):
    parents = tuple(p.__name__ for p in ((parents, ) if isinstance(parents, type) else parents))    # pylint: disable=superfluous-parens
    if inspect.isclass(child):
        bases = [c.__name__ for c in inspect.getmro(child)[1:]]
        if any([p in bases for p in parents]):
            return True
    return False


def load_test_suite() -> SetupTestSuite:
    suite = SetupTestSuite()
    for d in test_dirs:
        suite.addTests(unittest.defaultTestLoader.discover(start_dir=d, pattern="*_tests.py"))
    return get_tests(suite)


def tests_in_suite(suite: unittest.TestSuite) -> Dict[str, Dict[str, Union[str, Dict[str, str]]]]:
    rtn = {}
    for test in suite:
        if unittest.suite._isnotsuite(test):
            t = test.id().split(".")[-2:]
            f = getattr(test, t[1])
            rtn.setdefault(t[0], dict(
                profile=test.profile,
                doc=(getattr(test, "__doc__", "") or "").strip(),
                tests={}
            ))["tests"][t[1]] = (getattr(f, "__doc__", "") or "").strip()
        else:
            rtn.update(tests_in_suite(test))
    return rtn


def _load_tests(s: unittest.TestSuite, t: Union[Dict[str, List[str]], List[str]], **kwargs) -> list:
    rtn = []
    test_list = []
    if isinstance(t, dict):
        for c, ts in t.items():
            c = c if c.endswith("_UnitTests") else f"{c}_UnitTests"
            test_list.extend([f"{c}{f'.{f}' if f else ''}" for f in ts] if ts else [c])
    else:
        test_list.extend(t)

    for test in s:
        if unittest.suite._isnotsuite(test):
            f = test.id().split(".")[-2:]
            cls = test.__class__
            if not inherits_from(cls, SetupTestCase):
                cls = type(
                    cls.__name__,
                    (SetupTestCase, ),
                    {
                        "__doc__": getattr(cls, "__doc__", ""),
                        "profile": getattr(cls, "profile", "Unknown"),
                        f[1]: getattr(test.__class__, f[1])
                    }
                )
            for t in test_list:  # pylint: disable=redefined-argument-from-local
                t = t.split(".")
                if (t[0] == f[0] and len(t) == 1) or (t[0] == f[0] and t[1] == f[1]):
                    rtn.append(cls(f[1], **kwargs))
        else:
            rtn.extend(_load_tests(test, test_list))
    return rtn


def get_tests(suite: unittest.TestSuite, tests: Dict[str, List[str]] = None, **kwargs) -> SetupTestSuite:
    tests = tests or {k: [] for k in tests_in_suite(suite)}
    rtn = SetupTestSuite(**kwargs)
    rtn.addTests(_load_tests(suite, tests, **kwargs))
    return rtn


class TestResults(unittest.TextTestResult):
    _testReport: dict

    def __init__(self, stream, descriptions, verbosity):
        super().__init__(stream, descriptions, verbosity)
        self._testReport = {}

    def getReport(self, verbose: bool = False) -> dict:
        """
        Returns the run tests as a list of the form of a dict
        """
        rtn = dict(
            stats=dict(
                Overall=self._getStats(self._testReport, True)
            )
        )

        for profile, tests in self._testReport.items():
            rtn[profile] = {}
            for key, val in tests.items():
                if verbose:
                    rtn[profile][key] = {k: v if isinstance(v, str) else "" for k, v in val.items()}
                else:
                    rtn[profile][key] = list(val.keys())
            rtn["stats"][profile] = self._getStats(rtn[profile])

        print("")
        return rtn

    def addError(self, test: unittest.case.TestCase, err) -> None:
        super().addError(test, err)
        self._addReport("error", test, err)

    def addFailure(self, test: unittest.case.TestCase, err) -> None:
        super().addFailure(test, err)
        self._addReport("failure", test, err)

    def addSuccess(self, test: unittest.case.TestCase) -> None:
        super().addSuccess(test)
        self._addReport("success", test)

    def addExpectedFailure(self, test: unittest.case.TestCase, err) -> None:
        super().addExpectedFailure(test, err)
        self._addReport("expected_failure", test, err)

    def addSkip(self, test: unittest.case.TestCase, reason: str) -> None:
        super().addSkip(test, reason)
        self._addReport("skipped", test, reason)

    def addUnexpectedSuccess(self, test: unittest.case.TestCase) -> None:
        super().addUnexpectedSuccess(test)
        self._addReport("unexpected_success", test)

    def addSubTest(self, test, subtest, err):
        subparams = ", ".join([f"{k}='{v}'" for k, v in subtest.params.items()])
        subtest._testMethodName = f"{test._testMethodName} subTest({subparams})"
        subtest.profile = test.profile
        if err is None:
            self.addSuccess(subtest)
        else:
            self.addFailure(subtest, err)

        super(TestResults, self).addSubTest(test, subtest, err)
        # add to total number of tests run
        self.testsRun += 1

    # Helper Functions
    def _addReport(self, category: str, test: unittest.case.TestCase, err: Union[tuple, str] = None) -> None:
        profile = getattr(test, "profile", "Unknown")
        val = err or test
        if isinstance(val, tuple):
            exctype, value, _ = err
            val = f"{exctype.__name__}: {value}"

        self._testReport.setdefault(profile, {}).setdefault(category, {})[test._testMethodName] = val

    def _getStats(self, results: dict, overall: bool = False) -> Dict[str, int]:
        stats = ("error", "failure", "success", "expected_failure", "skipped", "unexpected_success")
        rtn = dict(
            total=0,
            error=0,
            failure=0,
            success=0,
            expected_failure=0,
            skipped=0,
            unexpected_success=0
        )

        if overall:
            for p in results:
                for s in stats:
                    c = len(results[p].get(s, {}))
                    rtn[s] += c
                    rtn["total"] += c
        else:
            for s in stats:
                c = len(results.get(s, {}))
                rtn[s] += c
                rtn["total"] += c

        return rtn
