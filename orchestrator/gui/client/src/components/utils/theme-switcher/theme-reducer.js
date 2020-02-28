import * as theme from './theme-actions';

const initialState = {};

export default (state=initialState, action=null) => {
  switch (action.type) {
    case theme.THEME_SUCCESS:
      return {
        ...state,
        [action.meta.name]: action.payload || ''
      };

    case theme.THEME_FAILURE:
      console.log('Theme Failure', action.type, action);
      const tmpState = { ...state };
      if (action.meta.name in tmpState) {
        delete tmpState[action.meta.name];
      }
      return tmpState;

    default:
      return state;
  }
};
