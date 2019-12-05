import React, { PureComponent, ChangeEvent } from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import is from 'styled-is';
import ToastsManager from 'toasts-manager';

import { LoadValidatorsParams } from './Validators.connect';
import { formatCyber } from '../../utils/cyberway';
import { ValidatorType } from '../../types';
import AccountName from '../../components/AccountName';
import EmissionInfo from '../../components/EmissionInfo';

const EMPTY_KEY = 'GLS1111111111111111111111111111111114T1Anm';
const NEVER_PICK_TIME = new Date('2019-08-15T14:00:00.000Z').getTime();
const SYSTEM_MIN_OWN_STAKED = 500000000;
const SHOW_BLOCK_MISS_EMOJI = Boolean(localStorage.getItem('showBlockMissEmoji'));

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
const AccountNameStyled = styled(AccountName)`
  width: 160px;
  height: 60px;
  float: left;
`;

const RewardFee = styled.span`
  padding-right: 6px;
`;

const MinOwnStakedStyled = styled.span`
  padding-right: 6px;
`;

const Label = styled.label`
  padding-right: 32px;
`;

type MinStakedProps = {
  value: number;
  systemMin?: number;
  cyberFull?: boolean;
} & React.ComponentProps<any>;

function MinOwnStaked({ value, systemMin, cyberFull, ...props }: MinStakedProps) {
  if (!systemMin) {
    systemMin = SYSTEM_MIN_OWN_STAKED;
  }
  const color = value < systemMin ? 'darkred' : value > systemMin ? 'darkgreen' : 'default';

  return (
    <MinOwnStakedStyled {...props}>
      Min own staked: <b style={{ color }}>{formatCyber(value || 0, cyberFull)}</b>
    </MinOwnStakedStyled>
  );
}

export type Props = {
  loadValidators: (params: LoadValidatorsParams) => any;
};

export type State = {
  validators: ValidatorType[] | null;
  updateTime: Date | null;
  supply: number;
  totalStaked: number;
  totalVotes: number;
  showPausedValidators: boolean;
  showFullCyber: boolean;
  showCumulativePercent: boolean;
};

export default class Validators extends PureComponent<Props, State> {
  state = {
    validators: null,
    updateTime: null,
    supply: 0,
    totalStaked: 0,
    totalVotes: 0,
    showPausedValidators: true,
    showFullCyber: false,
    showCumulativePercent: false,
  };

  componentDidMount() {
    this.loadValidators();
  }

  async loadValidators() {
    const { loadValidators } = this.props;
    try {
      const { items, updateTime, supply, totalStaked, totalVotes } = await loadValidators({});
      this.setState({
        validators: items,
        updateTime,
        supply,
        totalStaked,
        totalVotes,
      });
    } catch (err) {
      ToastsManager.error(`Validators loading failed: ${err.message}`);
    }
  }

  pausedModeChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ showPausedValidators: !!e.target.checked });
  };

  cyberModeChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ showFullCyber: !!e.target.checked });
  };

  percentModeChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ showCumulativePercent: !!e.target.checked });
  };

  renderLine(
    {
      account,
      signingKey,
      username,
      latestPick,
      votes,
      props,
      produced,
      missed,
      weekMissed,
      latestBlock,
    }: ValidatorType,
    totalVotes: number,
    pctSum: { sum: number }
  ) {
    const { showFullCyber, showCumulativePercent, showPausedValidators } = this.state;
    const paused = signingKey === EMPTY_KEY;
    if (paused && !showPausedValidators) {
      return null;
    }
    const missIdx = weekMissed ? Math.ceil(Math.log10(weekMissed + 1)) : 0;
    const missGrade = ['✅', '👌', '⚠️', '😱', '🆘', '💀'][missIdx];
    const pickDate = new Date(latestPick);
    const votesStyle = votes < SYSTEM_MIN_OWN_STAKED ? { color: 'darkred' } : {};
    const fee = props ? props.fee / 100 : 100;
    const percent = (100 * votes) / totalVotes;
    pctSum.sum += percent;

    return (
      <AccountItem key={account} paused={paused}>
        <AccountNameStyled account={{ id: account, golosId: username }} addLink twoLines />
        Votes: <span style={votesStyle}>{formatCyber(votes, showFullCyber)}</span> (
        {(showCumulativePercent ? pctSum.sum : percent).toFixed(3)}%);{' '}
        <small title="Time when validator appeared in block producing schedule">
          Latest pick:{' '}
          {pickDate.getTime() === NEVER_PICK_TIME ? 'never' : pickDate.toLocaleString()}
        </small>
        <br />
        {props ? (
          <>
            <RewardFee title={`Validator gives ${(100 - fee).toFixed(2)}% of reward to voters`}>
              Reward fee: <b>{fee.toFixed(0)}%</b>;
            </RewardFee>
            <MinOwnStaked
              value={props.minOwnStaked}
              title="Validator declares he staked at least this amount"
              cyberFull={showFullCyber}
            />
          </>
        ) : null}
        <br />
        <small>
          <span title={`latest block: ${latestBlock ? latestBlock.toLocaleString() : 'never'}`}>
            Produced blocks: {produced}
          </span>
          ; missed: {missed}; missed during 7 days: {weekMissed}{' '}
          {SHOW_BLOCK_MISS_EMOJI ? produced || weekMissed ? missGrade : '💤' : null}
          <br />
        </small>
        <small>(signing key: {signingKey})</small>
      </AccountItem>
    );
  }

  render() {
    const { validators, updateTime, supply, totalStaked, totalVotes } = this.state;
    const pctSum = { sum: 0 };

    return (
      <Wrapper>
        <Helmet title="Validators" />
        <EmissionInfo supply={supply} staked={totalStaked} voted={totalVotes} />
        <Title>Validators:</Title>
        {validators ? (
          <>
            {updateTime ? (
              <UpdateTime>
                Last updated at {new Date(updateTime as any).toLocaleString()}
              </UpdateTime>
            ) : null}
            <Label>
              Show inactive validators:{' '}
              <input
                type="checkbox"
                onChange={this.pausedModeChange}
                checked={this.state.showPausedValidators}
              />
            </Label>
            <Label>
              Show full CYBER values:{' '}
              <input
                type="checkbox"
                onChange={this.cyberModeChange}
                checked={this.state.showFullCyber}
              />
            </Label>
            <Label>
              Show cumulative %:{' '}
              <input
                type="checkbox"
                onChange={this.percentModeChange}
                checked={this.state.showCumulativePercent}
              />
            </Label>
            <hr />
            <List>
              {(validators as any).map((item: ValidatorType) =>
                this.renderLine(item, totalVotes, pctSum)
              )}
            </List>
          </>
        ) : (
          'Loading ...'
        )}
      </Wrapper>
    );
  }
}
