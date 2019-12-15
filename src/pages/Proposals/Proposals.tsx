import React, { PureComponent } from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';

import Link from '../../components/Link';
import { ErrorLine } from '../../components/Form';
import { BaseProposalType } from '../../types';
import { formatTime } from '../../utils/cyberway';

const Wrapper = styled.div`
  margin: 16px 16px 200px;
`;

const Title = styled.h1`
  margin: 12px 0;
`;

const List = styled.ol`
  margin: 8px 0;
  padding-left: 24px;

  & li {
    list-style: decimal;
    margin: 6px;
  }
`;

type Props = {
  account: string;
  error: string | null;
  loadProposals: Function;
};

type State = {
  items: BaseProposalType[];

  loadingProposals: string | null;
  error: string;
};

export default class Proposals extends PureComponent<Props, State> {
  state = {
    items: [] as BaseProposalType[],

    loadingProposals: null,
    error: '',
  };

  componentDidMount() {
    if (!this.props.error) {
      this.loadProposals();
    }
  }

  async loadProposals() {
    const { account, loadProposals } = this.props;
    try {
      this.setState({ loadingProposals: account });

      const { items }: { items: BaseProposalType[] } = await loadProposals({ proposer: account });
      items.sort((a, b) => a.blockNum - b.blockNum);

      this.setState({
        items,
        loadingProposals: null,
      });
    } catch (err) {
      const error = 'Failed to load proposals';
      ToastsManager.error(`${error}: ${err.message}`);
      this.setState({ error });
    }
  }

  proposalUrl(name: string, version?: number) {
    const base = `/account/${this.props.account}/proposal/${name}`;
    return version ? `${base}/${version}` : base;
  }

  renderProposal(proposal: BaseProposalType, versions: { [key: string]: number }) {
    const { name, blockNum, blockTime, finished, updateTime, expires } = proposal;
    const { status } = finished || {
      status: expires && new Date(expires).getTime() <= Date.now() ? 'old' : 'wait',
    };
    const STATUS = {
      exec: 'executed',
      cancel: 'cancelled',
      wait: 'waiting',
      old: 'expired',
    };
    const version = versions[name];

    versions[name] = (version || 1) + 1;

    return (
      <>
        <Link to={this.proposalUrl(name, version)}>
          <b>
            {name}
            {version && ` (ver.${version})`}
          </b>
        </Link>
        , status: {STATUS[status]}
        <small>
          , created: {blockTime ? `${formatTime(blockTime)},` : 'on'} block #
          <Link to={`/block/${blockNum}`}>{blockNum}</Link>
          {updateTime && (
            <>
              ,{' '}
              <span title="Someone approved, unapproved, executed or cancelled the proposal">
                updated: {formatTime(updateTime)}
              </span>
            </>
          )}
        </small>
      </>
    );
  }

  render() {
    const { account } = this.props;
    const { items, loadingProposals } = this.state;
    const error = this.props.error || this.state.error;
    const versions: { [key: string]: number } = {};

    return (
      <Wrapper>
        <Helmet title={`Proposals created by ${account}`} />
        <Title>Proposer: {account}</Title>
        <h2>Proposals</h2>
        {error ? (
          <ErrorLine>{error}</ErrorLine>
        ) : items.length > 1 ? (
          <List>
            {items.map((x, i) => (
              <li key={i}>{this.renderProposal(x, versions)}</li>
            ))}
          </List>
        ) : loadingProposals ? (
          'Loading…'
        ) : (
          'No proposals'
        )}
      </Wrapper>
    );
  }
}
