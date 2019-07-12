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

    return {
      accountId,
    };
  },
  {
    loadAccount: (accountId: string) => {
      return () => new Promise(() => {}) as any;

      const params = {
        accountId,
      };

      return {
        type: CALL_API,
        method: 'blocks.getAccount',
        params,
        types: [FETCH_ACCOUNT, FETCH_ACCOUNT_SUCCESS, null],
        meta: { ...params },
      };
    },
  }
)(Account);
