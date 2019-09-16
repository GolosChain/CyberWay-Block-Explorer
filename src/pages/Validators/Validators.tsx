import React, { PureComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import ToastsManager from 'toasts-manager';

import { LoadValidatorsParams } from './Validators.connect';
import { ValidatorType } from '../../types';
import Link from '../../components/Link';

const EMPTY_KEY = 'GLS1111111111111111111111111111111114T1Anm';
const NEVER_PICK_TIME = new Date('2019-08-15T14:00:00.000Z').getTime();
const SYSTEM_MIN_OWN_STAKED = 500000000;

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

const AccountItem = styled.li<{ paused: boolean }>`
  margin: 4px 0 8px;
  list-style: decimal;
  clear: both;

  &:hover {
    background: #ffd;
  }

  ${is('paused')`
    opacity: 0.5;
  `};
`;

// TODO: fix
const AccountName = styled.div`
  width: 160px;
  height: 40px;
  float: left;
`;

const Username = styled.small`
  color: #888;
`;

const RewardFee = styled.span`
  padding-right: 6px;
`;

const MinOwnStakedStyled = styled.span`
  padding-right: 6px;
`;

function formatCyber(x: number) {
  return (x / 10000).toFixed(4) + ' CYBER';
}

type MinStakedProps = {
  value: number;
  systemMin?: number;
} & React.ComponentProps<any>;

function MinOwnStaked({ value, systemMin, ...props }: MinStakedProps) {
  if (!systemMin) {
    systemMin = SYSTEM_MIN_OWN_STAKED;
  }
  const color = value < systemMin ? 'darkred' : value > systemMin ? 'darkgreen' : 'default';

  return (
    <MinOwnStakedStyled {...props}>
      Min own staked: <b style={{ color: color }}>{formatCyber(value || 0)}</b>
    </MinOwnStakedStyled>
  );
}

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

  renderLine({ account, signKey, username, latestPick, votes, percent, props }: ValidatorType) {
    const paused = signKey === EMPTY_KEY;
    const pickDate = new Date(latestPick);
    const votesStyle = votes < SYSTEM_MIN_OWN_STAKED ? { color: 'darkred' } : {};
    const fee = props && props.fee ? props.fee / 100 : 100;

    return (
      <AccountItem key={account} paused={paused}>
        <AccountName>
          <Link to={`/account/${account}`}>{account}</Link>
          <br />
          {typeof username === 'string' ? <Username>{username}@@gls</Username> : null}
        </AccountName>
        Votes: <span style={votesStyle}>{formatCyber(votes)}</span> ({percent.toFixed(3)}%);{' '}
        <span title="Time when validator appeared in block producing schedule">
          Latest pick:{' '}
          {pickDate.getTime() === NEVER_PICK_TIME ? 'never' : pickDate.toLocaleString()}
        </span>
        <br />
        {props ? (
          <>
            <RewardFee title={`Validator gives ${(100 - fee).toFixed(2)}% of reward to voters`}>
              Reward fee: <b>{fee.toFixed(0)}%</b>;
            </RewardFee>
            <MinOwnStaked
              value={props.minStake}
              title="Validator declares he staked at least this amount"
            />
          </>
        ) : null}
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
            <li>Total staked: {formatCyber(totalStaked)}</li>
            <li>Total votes: {formatCyber(totalVotes)}</li>
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
