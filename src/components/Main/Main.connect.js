import { connect } from 'react-redux';

import { FETCH_BLOCK_CHAIN_INFO_SUCCESS } from '../../store/constants';
import Main from './Main';
import Connection from '../../utils/Connection';
import ToastsManager from 'toasts-manager';

export default connect(
  null,
  {
    loadBlockChainInfo: () => async dispatch => {
      let results;

      try {
        results = await Connection.get().callApi('blocks.getBlockChainInfo');
      } catch (err) {
        console.error(err);
        ToastsManager.error(`Request failed:, ${err.message}`);
        return;
      }

      dispatch({
        type: FETCH_BLOCK_CHAIN_INFO_SUCCESS,
        payload: results,
      });
    },
  }
)(Main);
