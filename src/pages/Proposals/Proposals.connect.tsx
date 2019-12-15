import { connect } from 'react-redux';
import { CALL_API } from '../../store/middlewares/callApi';
import { State } from '../../store';
import { isAccountNameValid } from '../../utils/domain';
import { BaseAccountRouteParams } from '../../routes/Routes';
import Proposals from './Proposals';

type Props = {
  match: {
    params: BaseAccountRouteParams;
  };
};

export type LoadProposalsParams = { proposer: string };

export default connect(
  (state: State, props: Props) => {
    const { account } = props.match.params;
    let error = isAccountNameValid(account) ? null : 'invalid account';

    return { account, error };
  },
  {
    loadProposals: (params: LoadProposalsParams) => ({
      type: CALL_API,
      method: 'accounts.getProposals',
      params,
      meta: { ...params },
    }),
  }
)(Proposals);
