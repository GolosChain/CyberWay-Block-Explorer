import React, { PureComponent } from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';

import { AuthType } from '../../types';
import { Field, FieldTitle, ErrorLine } from '../../components/Form';
import TrxPretty from '../../components/TrxPretty';
import Link from '../../components/Link';
import { deserializeTrx } from '../../utils/cyberway';
import { msigApprove, msigUnapprove, msigCancel, msigExec } from '../../utils/cyberwayActions';

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
  & a {
    display: none;
  }
  &:hover a {
    display: inline;
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

const TinyLink = styled(Link)`
  font-size: 70%;
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
  level: string;
  status?: string;
  time?: string; //Date;
};

type Props = {
  account: string;
  proposal: string;
  error: string | null;
  loadProposals: Function;
};

type State = {
  proposalName: string;
  packedTrx: string;
  trx: any;
  blockNum: number;
  approvals: ApprovalType[];

  updateTime?: string; //Date,
  expires: string; //Date,
  finalStatus?: string;
  execTrxId?: string;

  loadingProposal: string | null;
  err: string[];
};

export default class Proposal extends PureComponent<Props, State> {
  state = {
    proposalName: '',
    packedTrx: '',
    trx: null,
    blockNum: -1,
    approvals: [] as ApprovalType[],
    updateTime: undefined,
    expires: '',
    finalStatus: undefined,
    execTrxId: undefined,

    loadingProposal: null,
    err: [],
  };

  componentDidMount() {
    if (!this.props.error) {
      this.loadProposal();
    }
  }

  appendError(error: string) {
    const err = [...this.state.err, error];
    this.setState({ err });
  }

  async loadProposal() {
    const { account, proposal, loadProposals } = this.props;
    try {
      const empty = { packedTrx: '', trx: null };
      this.setState({ loadingProposal: proposal, ...empty });

      const { items } = await loadProposals({ proposer: account, name: proposal });
      const ok = items && items.length >= 1;
      const item = ok ? items[0] : empty; // TODO: support several proposals with same proposer/name
      const { packedTrx, blockNum, approvals, updateTime, finalStatus, execTrxId } = item;
      let { expires } = item;

      let trx = null;
      if (ok) {
        if (packedTrx) {
          try {
            trx = await deserializeTrx({ trx: item.packedTrx });
            if (!expires) {
              expires = trx.expiration;
            }
          } catch (err) {
            console.error('%%%% failed to deserialize trx', err.message, err); // debug; TODO: remove/replace
          }
        } else {
          trx = item.trx; //TODO: deserialize actions
        }
      }

      this.setState({
        proposalName: proposal,
        loadingProposal: null,
        trx,
        packedTrx,
        blockNum,
        approvals,
        updateTime,
        expires,
        finalStatus,
        execTrxId,
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

  _signUrl(actions: any[]) {
    return `/sign?trx=${encodeURIComponent(JSON.stringify({ actions }))}`;
  }

  _strToLevel(level: string) {
    const [actor, permission] = level.split('@');
    return { actor, permission } as AuthType;
  }

  _formatTime(time: string | number) {
    return new Date(time).toLocaleString();
  }

  approveTrx(approval: ApprovalType, no: boolean, both?: boolean) {
    // TODO: add hash for `approve`
    const { account, proposal } = this.props;
    const level = this._strToLevel(approval.level);
    const actions = [(no ? msigUnapprove : msigApprove)(account, proposal, level)];

    if (both && no) {
      actions.unshift(msigApprove(account, proposal, level));
    }

    return this._signUrl(actions);
  }

  cancelProposalTrx() {
    const { account, proposal } = this.props;
    return this._signUrl([msigCancel(account, proposal)]);
  }

  executeProposalTrx() {
    const { account, proposal } = this.props;
    return this._signUrl([msigExec(account, proposal)]);
  }

  renderApproveButton(approval: ApprovalType, got: boolean, both?: boolean) {
    return (
      <LinkButton to={this.approveTrx(approval, got, both)} key={String(both)}>
        {got ? 'Unapprove 👎' : 'Approve 👍'}
      </LinkButton>
    );
  }

  renderApproveButtons(approval: ApprovalType, got: boolean) {
    const first = this.renderApproveButton(approval, got);
    const second = approval.time ? null : this.renderApproveButton(approval, !got, true);
    return [first, second];
  }

  renderApprovals(approvals: ApprovalType[], exists: boolean) {
    return (
      <ol>
        {approvals.map(x => {
          const got = (x.status || '').startsWith('approve');
          const time = (x.time ? new Date(x.time) : EMPTY_DATE).getTime();
          const haveTime = time !== EMPTY_DATE.getTime();

          return (
            <Approval key={x.level} className={got ? 'got' : haveTime ? 'lost' : ''}>
              {x.level}
              {haveTime
                ? ` / ${got ? 'approved' : 'unapproved'}: ${this._formatTime(time)}`
                : null}{' '}
              {exists ? this.renderApproveButtons(x, got) : null}
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
      blockNum,
      approvals,
      updateTime,
      expires,
      finalStatus,
      execTrxId,
      loadingProposal,
      err,
    } = this.state;

    const STATUS = {
      exec: 'executed',
      cancel: 'cancelled',
      wait: 'waiting',
      ready: '✅ready to exec',
      old: '❗️expired',
    };

    const exists = !finalStatus;
    const expired = Date.now() >= new Date(expires).getTime();
    const waitingStatus = expired ? 'old' : 'wait';
    const nRequested = approvals.length;
    const nApproved = approvals.filter(x => (x.status || '').startsWith('approve')).length;
    const status = finalStatus || (nApproved === nRequested ? 'ready' : waitingStatus);

    return (
      <Wrapper>
        <Helmet title={`Proposal "${proposal}" by ${account}`} />
        <Title>Proposer: {account}</Title>
        <h2>Proposal: {proposal}</h2>
        {error ? (
          <ErrorLine>{error}</ErrorLine>
        ) : err.length ? (
          err.map(e => (
            <p key={e}>
              <ErrorLine>{e}</ErrorLine>
            </p>
          ))
        ) : proposalName === proposal ? (
          <div>
            <Field line>
              {/* TODO: Created on block <Link to={`/block/${rev}`}>#{rev}</Link> */}
              <FieldTitle>Created on block:</FieldTitle> #{blockNum}
            </Field>
            <Field line>
              <FieldTitle>Status:</FieldTitle> <b>{STATUS[status]}</b>{' '}
              {execTrxId && <TinyLink to={`/trx/${execTrxId}`}>{execTrxId}</TinyLink>}
            </Field>
            {exists ? (
              <Field line>
                <FieldTitle>{expired ? 'Expired' : 'Expires'}:</FieldTitle>{' '}
                {this._formatTime(expires)}
              </Field>
            ) : null}
            <Field line>
              <FieldTitle title="Someone approved, unapproved, executed or cancelled the proposal">
                Last updated:
              </FieldTitle>{' '}
              {updateTime ? this._formatTime(updateTime!) : 'never'}
            </Field>
            <FieldTitle>Transaction:</FieldTitle>
            <TrxPretty trx={trx} packedTrx={packedTrx} />
            <Field line>
              <FieldTitle>Approvals:</FieldTitle> {nApproved}/{nRequested}{' '}
              {this.renderApprovals(approvals, exists)}
            </Field>
            {exists ? (
              <>
                <hr />
                <FieldTitle>Actions:</FieldTitle>{' '}
                <RedLinkButton to={this.cancelProposalTrx()}>Cancel</RedLinkButton>{' '}
                {expired ? null : <LinkButton to={this.executeProposalTrx()}>Try exec</LinkButton>}
              </>
            ) : null}
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
