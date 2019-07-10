import { connect } from 'react-redux';

import { CALL_API } from '../../store/middlewares/callApi';
import { State } from '../../store';
import { TransactionRouteParams } from '../../routes/Routes';
import { FETCH_TRANSACTION_SUCCESS } from '../../store/constants';

import Transaction from './Transaction';

type Props = {
  match: {
    params: TransactionRouteParams;
  };
};

export default connect(
  (state: State, props: Props) => {
    const { transactionId } = props.match.params;

    return {
      transaction: state.transactions[transactionId],
      transactionId,
      filters: state.filters,
    };
  },
  {
    loadTransaction: ({ transactionId }: { transactionId: string }) => ({
      type: CALL_API,
      method: 'blocks.getTransaction',
      params: {
        transactionId,
      },
      types: [null, FETCH_TRANSACTION_SUCCESS, null],
    }),
  }
)(Transaction);
