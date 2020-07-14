/* eslint no-restricted-globals: 0 */
// Actions for Theme endpoints
import http from 'http';
import https from 'https';

// Helper Functions
// None

const baseAPI = `${location.origin}/assets/css/`; // ${theme}.css`
const protocol = location.protocol === 'https' ? https : http;

// API Calls
// GET - '/assets/css/{theme}.css'
const THEME_REQUEST = '@@util/THEME_REQUEST';
export const THEME_SUCCESS = '@@util/THEME_SUCCESS';
export const THEME_FAILURE = '@@util/THEME_FAILURE';
export const loadTheme = theme => {
  return dispatch => {
    dispatch({ type: THEME_REQUEST });

    protocol.get(`${baseAPI}${theme}.css`, rsp => {
      let data = '';

      // A chunk of data has been recieved.
      rsp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      rsp.on('end', () => {
        dispatch({
          type: THEME_SUCCESS,
          payload: data,
          meta: {
            name: theme
          }
        });
      });
    })
    .on('error', err => dispatch({
      type: THEME_FAILURE,
      payload: err,
      meta: {
        name: theme
      }
    }));
  };
};
