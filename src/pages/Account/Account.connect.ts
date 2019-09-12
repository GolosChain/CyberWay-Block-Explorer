import { connect } from 'react-redux';

import { CALL_API } from '../../store/middlewares/callApi';
import {
  FETCH_ACCOUNT,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  MARK_GRANT_AS_CANCELED,
} from '../../store/constants';
import { State } from '../../store';

import { AccountRouteParams } from '../../routes/Routes';
import Account from './Account';

type Props = {
  match: {
    params: AccountRouteParams;
  };
};

export type LoadAccountParams = { accountId: string };

export type markGrantAsCanceledArg = {
  accountId: string;
  recipientId: string;
};

export default connect(
  ({ currentAccount }: State, props: Props) => {
    const { accountId, mode } = props.match.params;
    const { account, error } = currentAccount;

    return {
      accountId,
      account: account && account.id === accountId ? account : null,
      accountError: error,
      mode,
    };
  },
  {
    loadAccount: (accountId: string) => {
      const params = {
        accountId,
      };

      return {
        type: CALL_API,
        method: 'accounts.getAccount',
        params,
        types: [FETCH_ACCOUNT, FETCH_ACCOUNT_SUCCESS, FETCH_ACCOUNT_ERROR],
        meta: { ...params },
      };
    },
    markGrantAsCanceled: (params: markGrantAsCanceledArg) => ({
      type: MARK_GRANT_AS_CANCELED,
      payload: params,
    }),
  }
)(Account);
