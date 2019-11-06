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

export type LoadProposalParams = { proposer: string; proposal: string };

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
    loadProposal: (params: LoadProposalParams) => ({
      type: CALL_API,
      method: 'stateReader.getProposals',
      params: {
        filter: {
          proposer: params.proposer,
          proposal_name: params.proposal,
        },
      },
      meta: { ...params },
    }),
    loadApprovals: (params: LoadProposalParams) => ({
      type: CALL_API,
      method: 'stateReader.getProposalApprovals',
      params,
      meta: { ...params },
    }),
  }
)(Proposal);
