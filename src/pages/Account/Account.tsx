import React, { PureComponent } from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import is from 'styled-is';
import ToastsManager from 'toasts-manager';

import {
  AccountTransactionsMode,
  ApiError,
  GrantInfoType,
  KeyAuthType,
  ExtendedAccountType,
  TokenBalanceType,
  AgentPropsType,
  ProducingStatsType,
} from '../../types';
import { formatCyber, formatPct, recall, breakGrant, setProxyLevel } from '../../utils/cyberway';
import {
  setProxyLevelAction,
  recallVoteAction,
  setGrantTermsAction,
} from '../../utils/cyberwayActions';
import { Field, FieldTitle, FieldValue, ErrorLine } from '../../components/Form';
import AccountTransactions from '../../components/AccountTransactions';
import AccountKeys from '../../components/AccountKeys';
import AccountName from '../../components/AccountName';
import LoginDialog from '../../components/LoginDialog';
import Link from '../../components/Link';
import { changeGrantStateArg } from './Account.connect';

const SHOW_BREAKS = 'none'; // hide breaks until implement ui for change them

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const Wrapper = styled.div`
  margin: 16px;
`;

const Title = styled.h1`
  margin: 12px 0;
`;

const Subtitle = styled.h3`
  margin: 12px 0 4px;
  color: #666;
`;

const Info = styled.div`
  margin-bottom: 20px;
`;

const GrantsTable = styled.table`
  border: 1px solid #ccc;
`;

const GrantsTHead = styled.thead`
  background: #eee;
`;

const GrantsTFoot = styled.tfoot`
  background: #eee;
`;

const GrantsTBody = styled.tbody``;

const GrantItem = styled.tr`
  margin: 3px 0;

  &:hover {
    background: #ffd;
  }
`;

const GrantRecipient = styled.span<{ strike?: boolean }>`
  ${is('strike')`
    text-decoration: line-through;
    opacity: 0.3;
  `};
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
  background: #edd;
  text-decoration: none;
`;

const BaseButton = styled.button`
  ${BUTTON_STYLE}
`;

const RecallButton = styled(BaseButton)``;
const SetLevelButton = styled(BaseButton)``;
const BreakButton = styled(BaseButton)`
  background: #edd;
`;

const UpdatedAt = styled.div`
  margin-top: 4px;
  font-size: 13px;
`;

const TokenItem = styled.li`
  margin: 3px 0;
`;

const AgentInfo = styled.div``;
const RewardFee = styled.div``;
const MinOwnStaked = styled.div``;

const QualityTable = styled.table`
  margin: 6px 0;
  font-size: 14px;
  border: 1px solid #999;

  & th {
    background: #eee;
  }
  & td,
  & th {
    border: 1px solid #eee;
    border-width: 1px 1px 0 0;
    padding: 0 3px;
  }
`;

export type Props = {
  name: string;
  accountId: string | null;
  mode: AccountTransactionsMode | undefined;
  account: ExtendedAccountType | null;
  accountError: ApiError | null;
  loadAccount: (accountId: string) => any;
  changeGrantState: (params: changeGrantStateArg) => void;
};

export default class Account extends PureComponent<Props> {
  state = {
    password: '',
    isLoginOpen: false,
    changingProxyLevel: false,
    recallingForAccountId: null,
    breakingGrantToAccountId: null,
    signLink: null,
  };

  componentDidMount() {
    const { name, accountError, loadAccount } = this.props;

    if (!accountError)
      loadAccount(name).catch((err: Error) => {
        ToastsManager.error(`Account loading failed: ${err.message}`);
      });
  }

  onRecallClick(account: string) {
    this.setState({
      isLoginOpen: true,
      recallingForAccountId: account,
    });
  }

  onBreakClick(account: string) {
    this.setState({
      isLoginOpen: true,
      breakingGrantToAccountId: account,
    });
  }

  onSetLevelClick(currentLevel: number) {
    const action = setProxyLevelAction(this.props.accountId || '', 1);
    const trx = encodeURIComponent(JSON.stringify({ actions: [action] }));

    this.setState({
      signLink: `/sign?trx=${trx}`,
      isLoginOpen: true,
      changingProxyLevel: true,
    });
  }

  recallTrx(recalls: string[], breaks?: string[]) {
    const account = this.props.accountId || '';
    const actions: any[] = [
      ...recalls.map(recipient => recallVoteAction(account, recipient)),
      ...(breaks || []).map(recipient => setGrantTermsAction(account, recipient)),
    ];
    return `/sign?trx=${encodeURIComponent(JSON.stringify({ actions }))}`;
  }

  renderGrants(grants: GrantInfoType[]) {
    const show = { display: SHOW_BREAKS };
    const toRecall: string[] = [];
    const toBreak: string[] = [];
    let votes = 0;
    let percents = 0;

    return (
      <GrantsTable>
        <GrantsTHead>
          <tr>
            <th>
              <AccountName account={{ id: 'Validator/proxy', golosId: 'username' }} />
            </th>
            <th title="Amount of staking voted for validator/proxy">Voted amount</th>
            <th title="When increase staking, will auto-vote this % to validator/proxy">Auto %</th>
            <th style={show} title="Remove vote if validator increases fee above this %">
              Break on fee >
            </th>
            <th
              style={show}
              title="Remove vote if validator decreases min own staked below this amount"
            >
              Break on own staked &lt;
            </th>
            <th title="`Recall` to get votes back; `Break` to remove zero-voted grant with auto-%">
              Actions
            </th>
          </tr>
        </GrantsTHead>
        <GrantsTBody>
          {grants.map(grant => {
            const {
              recipient,
              username,
              share,
              percent,
              breakFee,
              breakMinStaked,
              agent,
              isCanceled,
            } = grant;
            const voted = Math.round((share * (agent.proxied + agent.balance)) / agent.sharesSum);

            if (voted) {
              toRecall.push(recipient);
              votes += voted;
            }
            if (percent) {
              toBreak.push(recipient);
              percents += percent;
            }

            return (
              <GrantItem key={recipient}>
                <td>
                  <GrantRecipient strike={isCanceled && share === 0 && percent === 0}>
                    <AccountName account={{ id: recipient, golosId: username }} />
                  </GrantRecipient>
                </td>
                <td>{share > 0 ? formatCyber(voted) : 0}</td>
                <td>{percent > 0 ? formatPct(percent) : '–'}</td>
                <td style={show}>{breakFee < 10000 ? `>${formatPct(breakFee)}` : 'no'}</td>
                <td style={show}>
                  {breakMinStaked > 0 ? `<${formatCyber(breakMinStaked)}` : 'no'}
                </td>
                <td>
                  {share === 0 ? null : (
                    <RecallButton onClick={() => this.onRecallClick(recipient)}>
                      Recall
                    </RecallButton>
                  )}
                  {share > 0 || percent === 0 ? null : (
                    <BreakButton onClick={() => this.onBreakClick(recipient)}>Break</BreakButton>
                  )}
                </td>
              </GrantItem>
            );
          })}
        </GrantsTBody>
        {grants.length > 1 ? (
          <GrantsTFoot>
            <tr>
              <td>Total:</td>
              <td>{formatCyber(votes)}</td>
              <td>{percents > 0 ? formatPct(percents) : '–'}</td>
              <td style={show}></td>
              <td style={show}></td>
              <td>
                {votes ? <LinkButton to={this.recallTrx(toRecall)}>Recall all</LinkButton> : null}
                <br />
                {percents ? (
                  <LinkButton to={this.recallTrx(toRecall, toBreak)}>Delete all</LinkButton>
                ) : null}
              </td>
            </tr>
          </GrantsTFoot>
        ) : null}
      </GrantsTable>
    );
  }

  renderTokens(tokens: TokenBalanceType[]) {
    return (
      <ul>
        {tokens.map(({ balance, payments }) => (
          <TokenItem key={balance.split(' ')[1]}>
            {balance}
            {payments && parseFloat(payments.split(' ')[0]) !== 0
              ? ` + payments: ${payments}`
              : null}
            ;
          </TokenItem>
        ))}
      </ul>
    );
  }

  renderAgent(agent: AgentPropsType | null | undefined) {
    const levels = ['Validator', 'Proxy', 'Voter', 'Voter', 'Voter', 'Unknown'];

    if (!agent) {
      return 'none (no proxy level yet)';
    }

    const lvl = agent.proxyLevel !== null ? agent.proxyLevel : levels.length - 1;
    const votes = [0, 30, 1, 1, 1, '?'][lvl];
    const voting = lvl ? `up to ${votes} vote${votes > 1 ? 's' : ''}` : `can't vote for others`;
    const fee = agent.fee !== null ? agent.fee / 100 : 100;
    const minStake = agent.minOwnStaked;

    return (
      <AgentInfo>
        <b>{levels[lvl]}</b>; proxy level: <b>{lvl}</b>, {voting}{' '}
        {lvl !== 1 && lvl < levels.length - 1 ? (
          <SetLevelButton onClick={() => this.onSetLevelClick(lvl)}>
            Change Level to 1
          </SetLevelButton>
        ) : null}
        {lvl === 0 ? (
          <>
            <RewardFee>
              Reward fee: {fee.toFixed(2)}% fee / {(100 - fee).toFixed(2)}% to voters;
            </RewardFee>
            <MinOwnStaked>
              Guarantees to preserve staked at least
              <span title={formatCyber(minStake, true)}> {formatCyber(minStake)} </span>
              of own tokens.
            </MinOwnStaked>
          </>
        ) : null}
      </AgentInfo>
    );
  }

  onLogin = async (auth: KeyAuthType) => {
    const { changeGrantState } = this.props;
    const { recallingForAccountId, breakingGrantToAccountId, changingProxyLevel } = this.state;

    try {
      if (changingProxyLevel) {
        await setProxyLevel({ auth, level: 1 });
      } else {
        const recalling = recallingForAccountId !== null;
        const recipientId = (recalling ? recallingForAccountId : breakingGrantToAccountId) as any;
        let share: number | null = null;
        let pct: number | null = null;

        if (recalling) {
          await recall({ auth, recipients: [recipientId] });
          share = 0;
        } else if (breakingGrantToAccountId !== null) {
          await breakGrant({ auth, recipients: [recipientId] });
          pct = 0;
        } else {
          throw new Error('bad onLogin state');
        }
        changeGrantState({ accountId: auth.accountId, recipientId, share, pct });
      }
      ToastsManager.info('Success');

      this.onLoginClose();
    } catch (err) {
      ToastsManager.error(err.message);
    }
  };

  onLoginClose = () => {
    this.setState({
      isLoginOpen: false,
      password: '',
      changingProxyLevel: false,
      recallingForAccountId: null,
      breakingGrantToAccountId: null,
    });
  };

  renderProducingStats(stats: ProducingStatsType, account: string) {
    let buckets = stats.buckets;
    const haveBuckets = buckets.length > 0;

    if (haveBuckets) {
      buckets = buckets
        .filter(item => item.account === account)
        .sort((a, b) => b.bucket.localeCompare(a.bucket));

      const totals = buckets.reduce(
        (result, item) => ({
          bucket: 'total',
          account,
          blocksCount: result.blocksCount + item.blocksCount,
          missesCount: result.missesCount + item.missesCount,
        }),
        { bucket: 'total', blocksCount: 0, missesCount: 0 }
      );
      const sortedBuckets = [
        {
          bucket: 'day',
          account,
          blocksCount: (stats.dayBlocks || { count: 0 }).count,
          missesCount: stats.dayMisses || 0,
        },
        {
          bucket: 'week',
          account,
          blocksCount: (stats.weekBlocks || { count: 0 }).count,
          missesCount: stats.weekMisses || 0,
        },
        ...buckets,
        totals,
      ];

      const bucketTitle = (bucketName: string) => {
        const yearMonth = parseInt(bucketName);
        if (isNaN(yearMonth)) {
          return bucketName;
        }

        const year = Math.round(yearMonth / 100);
        const month = yearMonth - year * 100;

        return `${MONTHS_SHORT[month]} ${2000 + year}`;
      };

      const thead = [];
      const prod = [];
      const miss = [];
      const rate = [];

      for (const b of sortedBuckets) {
        const sum = b.blocksCount + b.missesCount;

        thead.push(<th key={`th-${b.bucket}`}>{bucketTitle(b.bucket)}</th>);
        prod.push(<td key={`tr1-${b.bucket}`}>{b.blocksCount}</td>);
        miss.push(<td key={`tr2-${b.bucket}`}>{b.missesCount}</td>);
        rate.push(
          <td key={`tr3-${b.bucket}`}>
            {sum ? `${((b.missesCount / sum) * 100).toFixed(2)}%` : '—'}
          </td>
        );
      }

      return (
        <>
          <Subtitle>Validation quality:</Subtitle>
          <QualityTable>
            <thead>
              <tr>
                <th>Period:</th>
                {thead}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Produced:</th>
                {prod}
              </tr>
              <tr>
                <th>Missed:</th>
                {miss}
              </tr>
              <tr>
                <th>Miss rate:</th>
                {rate}
              </tr>
            </tbody>
          </QualityTable>
          Latest produced block:{' '}
          {stats.weekBlocks && stats.weekBlocks.latest
            ? new Date(stats.weekBlocks.latest).toLocaleString()
            : 'more than week ago'}
        </>
      );
    } else {
      return null;
    }
  }

  render() {
    const { name, accountId, account, accountError, mode } = this.props;
    const { isLoginOpen, signLink } = this.state;

    return (
      <Wrapper>
        <Helmet title={`Account: ${name}`} />
        <Title>Account</Title>
        <Info>
          <Field line>
            <FieldTitle>Account id:</FieldTitle> <FieldValue>{accountId}</FieldValue>
          </Field>
          {account && accountId ? (
            <>
              {account.golosId ? (
                <Field line>
                  <FieldTitle>Golos id:</FieldTitle> <FieldValue>{account.golosId}</FieldValue>
                </Field>
              ) : null}
              {account.keys ? (
                <>
                  <Subtitle>Keys:</Subtitle>
                  <AccountKeys keys={account.keys} />
                </>
              ) : null}

              <Subtitle>Validation role:</Subtitle>
              {this.renderAgent(account.agentProps)}

              {this.renderProducingStats(account.producingStats, accountId)}

              {account.grants ? (
                <>
                  <Subtitle>Grants:</Subtitle>
                  {account.grants.items.length ? (
                    this.renderGrants(account.grants.items)
                  ) : (
                    <span>none</span>
                  )}
                  <UpdatedAt>
                    Updated: {new Date(account.grants.updateTime).toLocaleString()}
                  </UpdatedAt>
                </>
              ) : null}
              {account.tokens && account.tokens.length ? (
                <>
                  <Subtitle>Balances:</Subtitle>
                  {this.renderTokens(account.tokens)}
                </>
              ) : null}
            </>
          ) : accountError ? (
            <ErrorLine>Loading error: {accountError.message}</ErrorLine>
          ) : (
            'Loading ...'
          )}
        </Info>
        {accountId && <AccountTransactions accountId={accountId} mode={mode || 'all'} />}
        {isLoginOpen && accountId ? (
          <LoginDialog
            account={account || { id: accountId, keys: null }}
            lockAccountId
            onLogin={this.onLogin}
            onClose={this.onLoginClose}
            signLink={signLink}
          />
        ) : null}
      </Wrapper>
    );
  }
}
