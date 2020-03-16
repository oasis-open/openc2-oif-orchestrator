import * as conformance from '../actions/conformance';
import { mergeByProperty } from '../components/utils';

const initialState = {
  conformanceTests: [],
  unitTests: {},
  sort: '',
  count: 0,
  errors: {}
};

export default (state=initialState, action=null) => {
  let tests = [];

  switch (action.type) {
    case conformance.GET_UNITTESTS_SUCCESS:
      return {
        ...state,
        unitTests: action.payload || {}
      };

    case conformance.GET_TESTS_SUCCESS:
      const newTests = action.payload.results || [];
      tests = action.meta.refresh ? newTests : mergeByProperty(state.conformanceTests, newTests, 'test_id');

      return {
        ...state,
        count: action.payload.count || 0,
        conformanceTests: tests,
        sort: action.meta.sort,
        errors: {
          ...state.errors,
          [conformance.GET_TESTS_FAILURE]: {}
        }
      };

    case conformance.GET_TEST_SUCCESS:
      const newTest = [action.payload] || [];

      return {
        ...state,
        conformanceTests: mergeByProperty(state.conformanceTests, newTest, 'test_id'),
        errors: {
          ...state.errors,
          [conformance.GET_TEST_FAILURE]: {}
        }
      };

    case conformance.RUN_UNITTEST_SUCCESS:
      return {
        ...state,
        count: state.count + 1,
        conformanceTests: mergeByProperty(state.conformanceTests, [action.payload], 'test_id'),
        errors: {
          ...state.errors,
          [conformance.RUN_UNITTEST_FAILURE]: {}
        }
      };

    case conformance.GET_TEST_FAILURE:
    case conformance.GET_UNITTESTS_FAILURE:
    case conformance.GET_UNITTESTS_PROFILE_FAILURE:
    case conformance.RUN_UNITTEST_FAILURE:
      console.log('Conformance Error', action.type, action);
      return {
        ...state,
        errors: {
          ...state.errors,
          [state.action]: action.payload
        }
      };

    default:
      return state;
  }
};
