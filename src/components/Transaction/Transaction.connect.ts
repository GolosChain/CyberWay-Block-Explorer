import { connect } from "react-redux";

import { Dispatch } from "../../types";
import { State } from "../../store";
import { FETCH_TRANSACTION_SUCCESS } from "../../store/constants";
import Connection from "../../utils/Connection";

import Transaction from "./Transaction";

type Props = {
  match: {
    params: any;
  };
};

export default connect(
  (state: State, props: Props) => {
    const { transactionId } = props.match.params;

    return {
      transaction: state.transactions[transactionId],
      transactionId
    };
  },
  {
    loadTransaction: ({ transactionId }: { transactionId: string }) => async (
      dispatch: Dispatch
    ) => {
      const result = await Connection.get().callApi("blocks.getTransaction", {
        transactionId
      });

      return dispatch({
        type: FETCH_TRANSACTION_SUCCESS,
        payload: result
      });
    }
  }
)(Transaction);
