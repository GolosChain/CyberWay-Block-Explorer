import { Dispatch } from 'redux';
import ToastsManager from 'toasts-manager';

import Connection from '../../utils/Connection';
import { FETCH_BLOCK_CHAIN_INFO_SUCCESS } from '../constants';

export const loadBlockChainInfo = () => async (dispatch: Dispatch) => {
  let results;

  try {
    results = await Connection.get().callApi('blocks.getBlockChainInfo');
  } catch (err) {
    console.error(err);
    ToastsManager.error(`Request failed: ${err.message}`);
    return;
  }

  dispatch({
    type: FETCH_BLOCK_CHAIN_INFO_SUCCESS,
    payload: results,
  });
};
