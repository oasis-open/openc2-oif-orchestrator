// Actions for conformance endpoints
import { createAction } from 'redux-api-middleware';
import { Actuator } from './actuator';
import { ActionFailureResult, ActionRequestResult, ActionSuccessResult } from './interfaces';
import { withGUIAuth } from './util';

export type TestStatus = 'success' | 'unexpected_success' | 'error' | 'failure' | 'expected_failure' | 'skipped';

export interface TestResults {
  stats: {
    [profile: string]:{
      success:  number;
      unexpected_success:  number;
      error:  number;
      failure:  number;
      expected_failure:  number;
      skipped:  number;
      total: number;
    };
  }
  [profile: string]: Record<TestStatus, Record<string, string>>;
}

export interface Test {
  actuator_tested?: Actuator;
  test_id: string;
  test_time: string;
  tests_run: Record<string, any>;
  test_results: TestResults;
}

export interface Tests {
    profiles: Array<string>;
    custom: {
      [profile: string]: Array<string>;
    };
}

// API Base URL
const baseAPI = '/api/conformance';

// Helper Functions

// API Calls
// GET - /api/conformance/unittest
const GET_UNITTESTS_REQUEST = '@@conformance/CONFORMANCE_GET_UNITTESTS_REQUEST';
export const GET_UNITTESTS_SUCCESS = '@@conformance/CONFORMANCE_GET_UNITTESTS_SUCCESS';
export const GET_UNITTESTS_FAILURE = '@@conformance/CONFORMANCE_GET_UNITTESTS_FAILURE';
export const getUnittests = () => createAction({
  endpoint: `${baseAPI}/unittest/`,
  method: 'GET',
  headers: withGUIAuth(),
  types: [
    GET_UNITTESTS_REQUEST, GET_UNITTESTS_SUCCESS, GET_UNITTESTS_FAILURE
  ]
});

export interface GetUnitTestAction extends ActionSuccessResult {
  type: typeof GET_UNITTESTS_SUCCESS;
}

// GET - /api/conformance/unittest/{PROFILE}
const GET_UNITTESTS_PROFILE_REQUEST = '@@conformance/CONFORMANCE_GET_UNITTESTS_PROFILE_REQUEST';
export const GET_UNITTESTS_PROFILE_SUCCESS = '@@conformance/CONFORMANCE_GET_UNITTESTS_PROFILE_SUCCESS';
export const GET_UNITTESTS_PROFILE_FAILURE = '@@conformance/CONFORMANCE_GET_UNITTESTS_PROFILE_FAILURE';
export const getUnittestsProfile = (profile: string) => createAction({
  endpoint: `${baseAPI}/unittest/${profile}`,
  method: 'GET',
  headers: withGUIAuth(),
  types: [
    GET_UNITTESTS_PROFILE_REQUEST, GET_UNITTESTS_PROFILE_SUCCESS, GET_UNITTESTS_PROFILE_FAILURE
  ]
});

export interface GetUnitTestsAction extends ActionSuccessResult {
  type: typeof GET_UNITTESTS_PROFILE_SUCCESS | typeof GET_UNITTESTS_PROFILE_FAILURE;
}

// POST - /api/conformance/unittest
const RUN_UNITTEST_REQUEST = '@@conformance/CONFORMANCE_RUN_UNITTEST_REQUEST';
export const RUN_UNITTEST_SUCCESS = '@@conformance/CONFORMANCE_RUN_UNITTEST_SUCCESS';
export const RUN_UNITTEST_FAILURE = '@@conformance/CONFORMANCE_RUN_UNITTEST_FAILURE';
export const runUnittest = (actuator: string, tests: Tests) => createAction({
  endpoint: `${baseAPI}/unittest/`,
  method: 'POST',
  headers: withGUIAuth(),
  body: JSON.stringify({
    actuator,
    tests
  }),
  types: [
    RUN_UNITTEST_REQUEST, RUN_UNITTEST_SUCCESS, RUN_UNITTEST_FAILURE
  ]
});

export interface RunUnitTestsAction extends ActionSuccessResult {
  type: typeof RUN_UNITTEST_SUCCESS;
}

// GET - /api/conformance/test/
const GET_TESTS_REQUEST = '@@conformance/CONFORMANCE_GET_TESTS_REQUEST';
export const GET_TESTS_SUCCESS = '@@conformance/CONFORMANCE_GET_TESTS_SUCCESS';
export const GET_TESTS_FAILURE = '@@conformance/CONFORMANCE_GET_TESTS_FAILURE';
export const getConformanceTests = ({
  page=1, count=10, sort='test_time', refresh=false
}={}) => createAction({
  endpoint: `${baseAPI}/test/?page=${page}&length=${count}&ordering=${sort}`,
  method: 'GET',
  headers: withGUIAuth(),
  types: [
    GET_TESTS_REQUEST,
    {
      type: GET_TESTS_SUCCESS,
      meta: {
        sort,
        refresh
      }
    },
    GET_TESTS_FAILURE
  ]
});

export interface GetConformanceTestsAction extends ActionSuccessResult {
  type: typeof GET_TESTS_SUCCESS;
  // payload: ??
  meta: {
    sort: string;
    refresh: boolean;
  };
}

// GET - /api/conformance/test/{TEST_ID}
const GET_TEST_REQUEST = '@@conformance/CONFORMANCE_GET_TEST_REQUEST';
export const GET_TEST_SUCCESS = '@@conformance/CONFORMANCE_GET_TEST_SUCCESS';
export const GET_TEST_FAILURE = '@@conformance/CONFORMANCE_GET_TEST_FAILURE';
export const getConformanceTest = (testId: string) => createAction({
  endpoint: `${baseAPI}/test/${testId}`,
  method: 'GET',
  headers: withGUIAuth(),
  types: [
    GET_TEST_REQUEST, GET_TEST_SUCCESS, GET_TEST_FAILURE
  ]
});

export interface GetConformanceTestAction extends ActionSuccessResult {
  type: typeof GET_TEST_SUCCESS;
}

// Request Actions
export interface ConformanceRequestActions extends ActionRequestResult {
  type: (
    typeof GET_UNITTESTS_REQUEST | typeof GET_UNITTESTS_PROFILE_REQUEST | typeof RUN_UNITTEST_REQUEST |
    typeof GET_TESTS_REQUEST | typeof GET_TEST_REQUEST
  );
}

// Failure Actions
export interface ConformanceFailureActions extends ActionFailureResult {
  type: (
    typeof GET_UNITTESTS_FAILURE | typeof GET_UNITTESTS_PROFILE_FAILURE | typeof RUN_UNITTEST_FAILURE |
    typeof GET_TESTS_FAILURE| typeof GET_TEST_FAILURE
  );
}

export type ConformanceActions = (
  ConformanceRequestActions | ConformanceFailureActions |
  // Success Actions
  GetUnitTestAction | GetUnitTestsAction | RunUnitTestsAction | GetConformanceTestsAction | GetConformanceTestAction
);