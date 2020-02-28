// Actions for Theme endpoints
import $ from 'jquery';

// Helper Functions
// None

const baseAPI = '/assets/css/'; // ${theme}.css`

// API Calls
// GET - '/assets/css/{theme}.css'
const THEME_REQUEST = '@@util/THEME_REQUEST';
export const THEME_SUCCESS = '@@util/THEME_SUCCESS';
export const THEME_FAILURE = '@@util/THEME_FAILURE';
export const loadTheme = theme => {
  return dispatch => {
    dispatch({ type: THEME_REQUEST });

    $.get(
      `${baseAPI}${theme}.css`,
      data => dispatch({
        type: THEME_SUCCESS,
        payload: data,
        meta: {
          name: theme
        }
      })
    )
    .fail(err => dispatch({
      type: THEME_FAILURE,
      payload: err,
      meta: {
        name: theme
      }
    }));
  };
};
