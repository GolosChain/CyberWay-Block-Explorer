import { Dispatch } from 'redux';

import { Action, CallApiType } from '../../types';
import Connection from '../../utils/Connection';
import { State } from '../reducers';

type GetState = () => State;

export const CALL_API = 'CALL_API';

export default ({ getState, dispatch }: { getState: GetState; dispatch: Dispatch }) => (
  next: Dispatch
) => async (action: Action) => {
  if (action.type !== CALL_API) {
    next(action);
    return;
  }

  const { method, params, types = [], meta } = (action as unknown) as CallApiType;
  const [CALL_TYPE, CALL_SUCCESS_TYPE, CALL_ERROR_TYPE] = types;

  if (CALL_TYPE) {
    dispatch({
      type: CALL_TYPE,
      payload: {},
      meta,
    });
  }

  let result;

  try {
    result = await Connection.get().callApi(method, params);
  } catch (err) {
    console.error(`Call api ${method} failed:`, err);

    if (CALL_ERROR_TYPE) {
      dispatch({
        type: CALL_ERROR_TYPE,
        payload: null,
        error: err,
        meta,
      });
    }

    throw err;
  }

  if (CALL_SUCCESS_TYPE) {
    dispatch({
      type: CALL_SUCCESS_TYPE,
      payload: result,
      meta,
    });
  }
};
