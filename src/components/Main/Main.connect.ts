import { connect } from "react-redux";
// @ts-ignore
import ToastsManager from "toasts-manager";

import { FETCH_BLOCK_CHAIN_INFO_SUCCESS } from "../../store/constants";
import { Dispatch } from "../../types";
import Main from "./Main";
import Connection from "../../utils/Connection";

export default connect(
  null,
  {
    loadBlockChainInfo: () => async (dispatch: Dispatch) => {
      let results;

      try {
        results = await Connection.get().callApi("blocks.getBlockChainInfo");
      } catch (err) {
        console.error(err);
        ToastsManager.error(`Request failed:, ${err.message}`);
        return;
      }

      dispatch({
        type: FETCH_BLOCK_CHAIN_INFO_SUCCESS,
        payload: results
      });
    }
  }
)(Main);
