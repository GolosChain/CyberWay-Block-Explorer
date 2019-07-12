import { connect } from 'react-redux';

import { CALL_API } from '../../store/middlewares/callApi';
import { FETCH_ACCOUNT, FETCH_ACCOUNT_SUCCESS } from '../../store/constants';
import { State } from '../../store';

import { AccountRouteParams } from '../../routes/Routes';
import Account from './Account';

type Props = {
  match: {
    params: AccountRouteParams;
  };
};

export type LoadAccountParams = { accountId: string; afterTrxId?: string };

export default connect(
  (state: State, props: Props) => {
    const { accountId } = props.match.params;

    let account = null;

    if (state.account.account && state.account.account.id === accountId) {
      account = state.account.account;
    }

    return {
      accountId,
      account,
      isEnd: state.account.isEnd,
      isLoading: state.account.isLoading,
    };
  },
  {
    loadAccount: ({ accountId, afterTrxId }: LoadAccountParams) => {
      const params = {
        accountId,
        afterTrxId,
        limit: 5,
      };

      return {
        type: CALL_API,
        method: 'blocks.getAccountTransactions',
        params,
        types: [FETCH_ACCOUNT, FETCH_ACCOUNT_SUCCESS, null],
        meta: { ...params },
      };
    },
  }
)(Account);
