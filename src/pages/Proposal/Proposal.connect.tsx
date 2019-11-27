import { connect } from 'react-redux';
import { CALL_API } from '../../store/middlewares/callApi';
import { State } from '../../store';
import { isNameValid, isAccountNameValid } from '../../utils/domain';
import { ProposalRouteParams } from '../../routes/Routes';
import Proposal from './Proposal';

type Props = {
  match: {
    params: ProposalRouteParams;
  };
};

export type LoadProposalsParams = { proposer: string; name: string };

export default connect(
  (state: State, props: Props) => {
    const { account, proposal } = props.match.params;
    const error = isAccountNameValid(account)
      ? isNameValid(proposal)
        ? null
        : 'invalid proposal'
      : 'invalid account';
    return { account, proposal, error };
  },
  {
    loadProposals: (params: LoadProposalsParams) => ({
      type: CALL_API,
      method: 'accounts.getProposals',
      params: {
        proposer: params.proposer,
        name: params.name,
      },
      meta: { ...params },
    }),
  }
)(Proposal);
