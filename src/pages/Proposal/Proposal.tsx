import React, { PureComponent } from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';

import { AuthType } from '../../types';
import { Field, FieldTitle, ErrorLine } from '../../components/Form';
import TrxPretty from '../../components/TrxPretty';
import Link from '../../components/Link';
import { deserializeTrx } from '../../utils/cyberway';
import {
  approveProposal,
  unapproveProposal,
  cancelProposal,
  execProposal,
} from '../../utils/cyberwayActions';

const EMPTY_DATE = new Date('1970-01-01T00:00:00.000Z');

const Wrapper = styled.div`
  margin: 16px 16px 200px;
`;

const Title = styled.h1`
  margin: 12px 0;
`;

const Approval = styled.li`
  margin: 6px 0;
  &.got {
    color: darkgreen;
  }
  &.lost {
    color: darkred;
  }
`;

const BUTTON_STYLE = `
  margin-left: 10px;
  font-size: 14px;
  border-radius: 4px;
  color: #333;
  background: #eee;
  cursor: pointer;
`;

const LinkButton = styled(Link)`
  ${BUTTON_STYLE}
  padding: 1px 7px 2px;
  border: 1px solid #aaa;
  border-color: rgb(216, 216, 216) rgb(209, 209, 209) rgb(186, 186, 186);
  display: inline-block;
  text-decoration: none;
`;

const RedLinkButton = styled(LinkButton)`
  background: #edd;
`;

type ApprovalType = {
  level: AuthType;
  time?: Date;
};

type Props = {
  account: string;
  proposal: string;
  error: string | null;
  loadProposal: Function;
  loadApprovals: Function;
};

type State = {
  proposalName: string;
  packedTrx: string;
  trx: any;
  rev: number;
  requested: ApprovalType[];
  provided: ApprovalType[];

  loadingProposal: string | null;
  loadingApprovals: string | null;
  err: string[];
};

export default class Proposal extends PureComponent<Props, State> {
  state = {
    proposalName: '',
    packedTrx: '',
    trx: null,
    rev: -1,
    requested: [],
    provided: [],
    loadingProposal: null,
    loadingApprovals: null,
    err: [],
  };

  componentDidMount() {
    if (!this.props.error) {
      this.loadProposal();
      this.loadApprovals();
    }
  }

  appendError(error: string) {
    const err = [...this.state.err, error];
    this.setState({ err });
  }

  async loadProposal() {
    const { account, proposal, loadProposal } = this.props;
    try {
      const empty = { packedTrx: '', trx: null, rev: -1 };
      this.setState({ loadingProposal: proposal, ...empty });

      const { items } = await loadProposal({ proposer: account, proposal });
      const ok = items && items.length === 1;
      const item = ok ? items[0] : empty;

      let trx = null;
      if (ok) {
        try {
          trx = await deserializeTrx({ trx: item.packedTransaction });
        } catch (err) {
          console.error('%%%% failed to deserialize trx', err.message, err); // debug; TODO: remove/replace
        }
      }

      this.setState({
        proposalName: proposal,
        loadingProposal: null,
        trx,
        packedTrx: item.packedTransaction,
        rev: item.rev,
      });
      if (!ok) {
        this.appendError('proposal not found');
      }
    } catch (err) {
      const error = 'Failed to load proposal';
      this.appendError(error);
      ToastsManager.error(`${error}: ${err.message}`);
    }
  }

  async loadApprovals() {
    const { account, proposal, loadApprovals } = this.props;
    try {
      const empty = { requested: [], provided: [] };
      this.setState({ loadingApprovals: proposal, ...empty });

      const { items } = await loadApprovals({ proposer: account, proposal });
      const ok = items && items.length === 1;
      const item = ok ? items[0] : empty;
      const timeFixer = (x: any) => ({ ...x, time: new Date(x.time || EMPTY_DATE) });

      this.setState({
        loadingApprovals: null,
        requested: item.requested.map(timeFixer),
        provided: item.provided.map(timeFixer),
      });
      if (!ok) {
        this.appendError('approvals not found');
      }
    } catch (err) {
      const error = 'Failed to load approvals';
      this.appendError(error);
      ToastsManager.error(`${error}: ${err.message}`);
    }
  }

  _signUrl(actions: any[]) {
    return `/sign?trx=${encodeURIComponent(JSON.stringify({ actions }))}`;
  }

  approveTrx(approval: ApprovalType, got: boolean) {
    // TODO: add hash for `approve`
    const { account, proposal } = this.props;
    const actions = [
      (got ? unapproveProposal : approveProposal)(account, proposal, approval.level),
    ];

    return this._signUrl(actions);
  }

  cancelProposalTrx() {
    const { account, proposal } = this.props;
    return this._signUrl([cancelProposal(account, proposal)]);
  }

  executeProposalTrx() {
    const { account, proposal } = this.props;
    return this._signUrl([execProposal(account, proposal)]);
  }

  renderApprovals(requested: ApprovalType[], approved: ApprovalType[]) {
    function equal(a: ApprovalType, b: ApprovalType) {
      return a.level.actor === b.level.actor && a.level.permission === b.level.permission;
    }

    const approvals = [...approved, ...requested];

    return this.state.loadingApprovals ? (
      'Loading…'
    ) : (
      <ol>
        {approvals.map(x => {
          const got = Boolean(approved.find(a => equal(x, a)));
          const time = (x.time || EMPTY_DATE).getTime();
          const haveTime = time !== EMPTY_DATE.getTime();

          return (
            <Approval key={x.level.actor} className={got ? 'got' : haveTime ? 'lost' : ''}>
              {x.level.actor} @ {x.level.permission}
              {haveTime
                ? ` / ${got ? 'approved' : 'unapproved'}: ${new Date(time).toLocaleString()}`
                : null}{' '}
              <LinkButton to={this.approveTrx(x, got)}>{got ? 'Unapprove' : 'Approve'}</LinkButton>
            </Approval>
          );
        })}
      </ol>
    );
  }

  render() {
    const { account, proposal, error } = this.props;
    const {
      proposalName,
      packedTrx,
      trx,
      rev,
      requested,
      provided,
      loadingProposal,
      err,
    } = this.state;
    const totalApprovals = requested.length + provided.length;

    return (
      <Wrapper>
        <Helmet title={`Proposal "${proposal}" by ${account}`} />
        <Title>Proposer: {account}</Title>
        <h2>Proposal: {proposal}</h2>
        {error ? (
          <ErrorLine>{error}</ErrorLine>
        ) : err.length ? (
          err.map(e => (
            <p>
              <ErrorLine>{e}</ErrorLine>
            </p>
          ))
        ) : proposalName === proposal ? (
          <div>
            <Field line>
              {/* TODO: Created on block <Link to={`/block/${rev}`}>#{rev}</Link> */}
              <FieldTitle>Created on block:</FieldTitle> #{rev}
            </Field>
            <FieldTitle>Transaction:</FieldTitle>
            <TrxPretty trx={trx} packedTrx={packedTrx} />
            <Field line>
              <FieldTitle>Approvals:</FieldTitle> {provided.length}/{totalApprovals}{' '}
              {this.renderApprovals(requested, provided)}
            </Field>
            <hr />
            <FieldTitle>Actions:</FieldTitle>{' '}
            <RedLinkButton to={this.cancelProposalTrx()}>Cancel</RedLinkButton>{' '}
            <LinkButton to={this.executeProposalTrx()}>Try exec</LinkButton>
          </div>
        ) : loadingProposal ? (
          'Loading…'
        ) : (
          '?'
        )}
      </Wrapper>
    );
  }
}
