import React, { PureComponent } from 'react';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';

import { LoadValidatorsParams } from './Validators.connect';
import { ValidatorType } from '../../types';
import Link from '../../components/Link';

const EMPTY_KEY = 'GLS1111111111111111111111111111111114T1Anm';
const NEVER_PICK_TIME = new Date('2019-08-15T14:00:00.000').getTime()

const Wrapper = styled.div`
  margin: 16px;
`;
const Title = styled.h1`
  margin: 12px 0;
`;
const UpdateTime = styled.div`
  margin: 0 0 16px;
`;
const List = styled.ol`
  margin: 0 0 40px 24px;
`;
const AccountItem = styled.li<{paused: boolean}>`
  margin: 4px 0 8px;
  list-style: decimal;
  clear: both;
  ${props => props.paused && ({
    opacity: 0.5
  })}
`;
// TODO: fix
const AccountName = styled.div`
  width: 160px;
  float: left
`;
const Username = styled.small`
  color:#888
`;

export type Props = {
  loadValidators: (params: LoadValidatorsParams) => any;
};

export type State = {
  validators: ValidatorType[] | null;
  updateTime: Date | null;
  totalStaked: number;
  totalVotes: number;
};

export default class Validators extends PureComponent<Props, State> {
  state = {
    validators: null,
    updateTime: null,
    totalStaked: 0,
    totalVotes: 0,
  };

  componentDidMount() {
    this.loadValidators();
  }

  async loadValidators() {
    const { loadValidators } = this.props;
    try {
      const { items, updateTime, totalStaked, totalVotes } = await loadValidators({});
      this.setState({
        validators: items,
        updateTime,
        totalStaked,
        totalVotes,
      });
    } catch (err) {
      ToastsManager.error(`Validators loading failed: ${err.message}`);
    }
  }

  formatCyber(x: number) {
    return (x/10000).toFixed(4) + ' CYBER';
  }

  renderLine({ account, signKey, username, latestPick, votes, percent }: ValidatorType) {
    const paused = signKey === EMPTY_KEY;
    const pickDate = new Date(latestPick);
    return (
      <AccountItem key={account} paused={paused}>
        <AccountName>
          <Link to={`/account/${account}`}>{account}</Link>
          <br/>
          {typeof username === "string" ? (
            <Username>{username}@@gls</Username>
          ) : null}
        </AccountName>
        Votes: {this.formatCyber(votes)} ({percent.toFixed(3)}%);
        Latest pick: {pickDate.getTime() === NEVER_PICK_TIME ? 'never' : pickDate.toLocaleString()}
        <br />
        <small>(signing key: {signKey})</small>
      </AccountItem>
    );
  }

  render() {
    const { validators, updateTime, totalStaked, totalVotes } = this.state;
    return (
      <Wrapper>
        {totalStaked ? (
          <ul>
            <li>Total staked: {this.formatCyber(totalStaked)}</li>
            <li>Total votes: {this.formatCyber(totalVotes)}</li>
          </ul>
        ) : null}
        <Title>Validators:</Title>
        {validators ? (
          <>
            {updateTime ? (
              <UpdateTime>
                Last updated at {new Date(updateTime as any).toLocaleString()}
              </UpdateTime>
            ) : null}
            <List>{(validators as any).map((item: ValidatorType) => this.renderLine(item))}</List>
          </>
        ) : (
          'Loading ...'
        )}
      </Wrapper>
    );
  }
}
