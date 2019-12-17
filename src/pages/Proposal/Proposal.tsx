import React, { PureComponent } from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';

import { AuthType, BaseProposalType } from '../../types';
import { Field, FieldTitle, ErrorLine } from '../../components/Form';
import TrxPretty from '../../components/TrxPretty';
import Link from '../../components/Link';
import AccountName from '../../components/AccountName';
import { deserializeTrx, formatTime } from '../../utils/cyberway';
import { msigApprove, msigUnapprove, msigCancel, msigExec } from '../../utils/cyberwayActions';
import { COLORS } from '../../utils/theme';

const EMPTY_DATE = new Date('1970-01-01T00:00:00.000Z');

const Wrapper = styled.div`
  margin: 16px 16px 200px;
`;

const Title = styled.h1`
  margin: 12px 0;
`;

const ProposalsLink = styled(Link)`
  font-size: 12px;
  font-weight: normal;
  margin-left: 12px;
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
  margin-left: 8px;
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

const List = styled.div`
  background: ${COLORS.yellow};
  padding: 12px;
  border-radius: 4px;
  margin: 8px 0;

  & ul {
    margin: 8px 12px;
  }
  & li {
    list-style: disc;
  }
`;

type ApprovalType = {
  level: string;
  status?: string;
  time?: string; //Date;
};

type ProposalType = BaseProposalType & {
  packedTrx: string;
  partialTrx: any; // comes from block service and have serialized actions
  trx: any;
  approvals: ApprovalType[];
};

type Props = {
  account: string;
  proposal: string;
  version: number;
  error: string | null;
  loadProposal: Function;
};

type State = {
  proposalName: string;
  items: ProposalType[];

  loadingProposal: string | null;
  err: string[];
};

export default class Proposal extends PureComponent<Props, State> {
  state = {
    proposalName: '',
    items: [] as ProposalType[],

    loadingProposal: null,
    err: [],
  };

  componentDidMount() {
    if (!this.props.error) {
      this.loadProposal();
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.version !== prevProps.version) {
      this.updateVersion();
    }
  }

  appendError(error: string) {
    const err = [...this.state.err, error];
    this.setState({ err });
  }

  async loadProposal() {
    const { account, proposal, loadProposal } = this.props;
    try {
      this.setState({ loadingProposal: proposal });

      const { items } = await loadProposal({ proposer: account, name: proposal });

      if (!items || !items.length) {
        this.appendError('proposal not found');
      }

      this.setState({
        proposalName: proposal,
        items: items.map((x: ProposalType) => ({ ...x, partialTrx: x.trx, trx: null })), // TODO: update block-service to return trx in other field
        loadingProposal: null,
      });

      this.updateVersion();
    } catch (err) {
      const error = 'Failed to load proposal';
      this.appendError(error);
      ToastsManager.error(`${error}: ${err.message}`);
    }
  }

  async updateVersion() {
    const { items } = this.state;
    const { version } = this.props;
    const idx = version - 1;
    const valid = idx < items.length;

    if (valid) {
      const item = items[idx];
      let { expires } = item;
      let trx = item.trx;

      if (!trx) {
        const { packedTrx, partialTrx } = item;

        if (packedTrx) {
          try {
            trx = await deserializeTrx({ trx: packedTrx });
            if (!expires) {
              const exp = trx.expiration;
              expires = `${exp}${exp.endsWith('Z') ? '' : 'Z'}`;
            }
          } catch (err) {
            console.error('%%%% failed to deserialize trx', err.message, err); // debug; TODO: remove/replace
          }
        } else {
          trx = partialTrx; //TODO: deserialize actions
        }
      }

      items[idx] = { ...item, trx, expires };
      this.setState({ err: [], items: [...items] });
    } else {
      this.appendError('There is no such version of the proposal');
    }
  }

  _signUrl(actions: any[]) {
    return `/sign?trx=${encodeURIComponent(JSON.stringify({ actions }))}`;
  }

  _strToLevel(level: string) {
    const [actor, permission] = level.split('@');
    return { actor, permission } as AuthType;
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
              {haveTime ? ` / ${got ? 'approved' : 'unapproved'}: ${formatTime(time)}` : null}{' '}
              {exists ? this.renderApproveButtons(x, got) : null}
            </Approval>
          );
        })}
      </ol>
    );
  }

  proposalUrl(version: number) {
    const { account, proposal } = this.props;
    return `/account/${account}/proposal/${proposal}/${version}`;
  }

  render() {
    const { account, proposal, version, error } = this.props;
    const { proposalName, items, loadingProposal, err } = this.state;
    const idx = version - 1;
    const {
      packedTrx = '',
      trx = null,
      blockNum = -1,
      blockTime = '',
      approvals = [],
      updateTime = undefined, // To make TS glad lol…
      expires = '',
      finished = undefined,
    } = items[idx] || {};

    const STATUS: { [key: string]: string } = {
      exec: 'executed', // TODO: can also check trx id existence to detect, is it executed/failed/delayed
      cancel: 'cancelled',
      wait: 'waiting',
      ready: '✅ready to exec',
      old: '❗️expired',
      oldcancel: 'expired and then cancelled',
    };

    const { status: finalStatus, actor, execTrxId } = finished || {};
    const exists = !finished;
    const expired = Date.now() >= new Date(expires).getTime();
    const waitingStatus = expired ? 'old' : 'wait';
    const nRequested = approvals.length;
    const nApproved = approvals.filter(x => (x.status || '').startsWith('approve')).length;
    let status = finalStatus || (nApproved === nRequested ? 'ready' : waitingStatus);

    if (status === 'cancel' && updateTime && new Date(updateTime) >= new Date(expires)) {
      status = 'oldcancel';
    }

    return (
      <Wrapper>
        <Helmet title={`Proposal "${proposal}" by ${account}`} />
        <Title>
          Proposer: {account}
          <ProposalsLink to={`/account/${account}/proposals`}>all proposals</ProposalsLink>
        </Title>
        <h2>Proposal: {proposal}</h2>
        {items.length > 1 ? (
          <List>
            There are several versions of this proposal:
            <ul>
              {items.map((x, i) => {
                const ver = i + 1;
                const body = `version ${ver}, block: #${x.blockNum}`;

                return (
                  <li key={i}>
                    {i !== idx ? <Link to={this.proposalUrl(ver)}>{body}</Link> : <b>{body}</b>}
                  </li>
                );
              })}
            </ul>
          </List>
        ) : null}
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
              <FieldTitle>Created:</FieldTitle> {blockTime ? `${formatTime(blockTime)}, ` : 'on '}
              block #<Link to={`/block/${blockNum}`}>{blockNum}</Link>
            </Field>
            <Field line>
              <FieldTitle>Status:</FieldTitle> <b>{!expires ? '?' : STATUS[status]}</b>
              {actor && (
                <>
                  {' '}
                  by <AccountName account={{ id: actor }} addLink />
                </>
              )}
              {execTrxId && <TinyLink to={`/trx/${execTrxId}`}>{execTrxId}</TinyLink>}
            </Field>
            {exists ? (
              <Field line>
                <FieldTitle>{expired ? 'Expired' : 'Expires'}:</FieldTitle> {formatTime(expires)}
              </Field>
            ) : null}
            <Field line>
              <FieldTitle title="Someone approved, unapproved, executed or cancelled the proposal">
                Last updated:
              </FieldTitle>{' '}
              {updateTime ? formatTime(updateTime!) : 'never'}
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
