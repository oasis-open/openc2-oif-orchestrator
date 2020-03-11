// Actions for conformance endpoints
import { RSAA } from 'redux-api-middleware';
import { withGUIAuth } from './util';

// API Base URL
const baseAPI = '/api/conformance';

// Helper Functions

// API Calls
// GET - /api/conformance/unittest
const GET_UNITTESTS_REQUEST = '@@conformance/CONFORMANCE_GET_UNITTESTS_REQUEST';
export const GET_UNITTESTS_SUCCESS = '@@conformance/CONFORMANCE_GET_UNITTESTS_SUCCESS';
export const GET_UNITTESTS_FAILURE = '@@conformance/CONFORMANCE_GET_UNITTESTS_FAILURE';
export const getUnittests = () => ({
  [RSAA]: {
    endpoint: `${baseAPI}/unittest/`,
    method: 'GET',
    headers: withGUIAuth(),
    types: [
      GET_UNITTESTS_REQUEST, GET_UNITTESTS_SUCCESS, GET_UNITTESTS_FAILURE
    ]
  }
});

// GET - /api/conformance/unittest/{PROFILE}
const GET_UNITTESTS_PROFILE_REQUEST = '@@conformance/CONFORMANCE_GET_UNITTESTS_PROFILE_REQUEST';
export const GET_UNITTESTS_PROFILE_SUCCESS = '@@conformance/CONFORMANCE_GET_UNITTESTS_PROFILE_SUCCESS';
export const GET_UNITTESTS_PROFILE_FAILURE = '@@conformance/CONFORMANCE_GET_UNITTESTS_PROFILE_FAILURE';
export const getUnittestsProfile = profile => ({
  [RSAA]: {
    endpoint: `${baseAPI}/unittest/${profile}`,
    method: 'GET',
    headers: withGUIAuth(),
    types: [
      GET_UNITTESTS_PROFILE_REQUEST, GET_UNITTESTS_PROFILE_SUCCESS, GET_UNITTESTS_PROFILE_FAILURE
    ]
  }
});


// GET - /api/conformance/conformance/
const GET_TESTS_REQUEST = '@@conformance/CONFORMANCE_GET_TESTS_REQUEST';
export const GET_TESTS_SUCCESS = '@@conformance/CONFORMANCE_GET_TESTS_SUCCESS';
export const GET_TESTS_FAILURE = '@@conformance/CONFORMANCE_GET_TESTS_FAILURE';
export const getConformanceTests = ({page=1, count=10, sort='test_time', refresh=false}={}) => ({
  [RSAA]: {
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
  }
});

// GET - /api/conformance/conformance/{TEST_ID}
const GET_TEST_REQUEST = '@@conformance/CONFORMANCE_GET_TEST_REQUEST';
export const GET_TEST_SUCCESS = '@@conformance/CONFORMANCE_GET_TEST_SUCCESS';
export const GET_TEST_FAILURE = '@@conformance/CONFORMANCE_GET_TEST_FAILURE';
export const getConformanceTest = test_id => ({
  [RSAA]: {
    endpoint: `${baseAPI}/test/${test_id}`,
    method: 'GET',
    headers: withGUIAuth(),
    types: [
      GET_TEST_REQUEST, GET_TEST_SUCCESS, GET_TEST_FAILURE
    ]
  }
});

// POST - /api/conformance/conformance
const RUN_TEST_REQUEST = '@@conformance/CONFORMANCE_RUN_TEST_REQUEST';
export const RUN_TEST_SUCCESS = '@@conformance/CONFORMANCE_RUN_TEST_SUCCESS';
export const RUN_TEST_FAILURE = '@@conformance/CONFORMANCE_RUN_TEST_FAILURE';
export const runTest = (actuator, tests) => ({
  [RSAA]: {
    endpoint: `${baseAPI}/test/`,
    method: 'POST',
    headers: withGUIAuth(),
    body: JSON.stringify({
      actuator,
      tests
    }),
    types: [
      RUN_TEST_REQUEST, RUN_TEST_SUCCESS, RUN_TEST_FAILURE
    ]
  }
});