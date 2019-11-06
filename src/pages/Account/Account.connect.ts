import { connect } from 'react-redux';
import { CALL_API } from '../../store/middlewares/callApi';
import {
  FETCH_ACCOUNT,
  FETCH_ACCOUNT_SUCCESS,
  FETCH_ACCOUNT_ERROR,
  CHANGE_GRANT_STATE,
} from '../../store/constants';
import { State } from '../../store';

import { AccountRouteParams } from '../../routes/Routes';
import Account from './Account';
import { parseName, validateParsedName } from '../../utils/domain';

type Props = {
  match: {
    params: AccountRouteParams;
  };
};

export type LoadAccountParams = { accountId: string };

export type changeGrantStateArg = {
  accountId: string;
  recipientId: string;
  share: number | null;
  pct: number | null;
};

export default connect(
  ({ currentAccount }: State, props: Props) => {
    const { name, mode } = props.match.params;
    const { account, error } = currentAccount;
    const parsed = parseName(name);
    const parseError = validateParsedName(parsed);
    const accountId =
      currentAccount && currentAccount.account
        ? currentAccount.account.id
        : !parseError && !parsed.username && parsed.account; // exclude user@@acc

    return {
      name,
      accountId: accountId || null,
      account: account && account.id === accountId ? account : null,
      accountError: parseError ? { code: -1, message: parseError } : error,
      mode,
    };
  },
  {
    loadAccount: (name: string) => {
      const params = { name };

      return {
        type: CALL_API,
        method: 'accounts.getAccount',
        params,
        types: [FETCH_ACCOUNT, FETCH_ACCOUNT_SUCCESS, FETCH_ACCOUNT_ERROR],
        meta: { ...params },
      };
    },
    changeGrantState: (params: changeGrantStateArg) => ({
      type: CHANGE_GRANT_STATE,
      payload: params,
    }),
  }
)(Account);
