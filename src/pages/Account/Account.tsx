import React, { PureComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import ToastsManager from 'toasts-manager';

import {
  AccountTransactionsMode,
  ApiError,
  GrantInfoType,
  AuthType,
  ExtendedAccountType,
  TokenBalanceType,
  AgentPropsType,
} from '../../types';
import { formatCyber, formatPct, recall, breakGrant, setProxyLevel } from '../../utils/cyberway';
import { Field, FieldTitle, FieldValue, ErrorLine } from '../../components/Form';
import AccountTransactions from '../../components/AccountTransactions';
import AccountKeys from '../../components/AccountKeys';
import AccountName from '../../components/AccountName';
import LoginDialog from '../../components/LoginDialog';
import { changeGrantStateArg } from './Account.connect';

const SHOW_BREAKS = 'none'; // hide breaks until implement ui for change them

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

const AccountNameStyled = styled(AccountName)`
  display: inline-block;
`;

const BaseButton = styled.button`
  margin-left: 10px;
  font-size: 14px;
  border-radius: 4px;
  color: #333;
  background: #eee;
  cursor: pointer;
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

export type Props = {
  accountId: string;
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
  };

  componentDidMount() {
    const { accountId, loadAccount } = this.props;

    loadAccount(accountId).catch((err: Error) => {
      ToastsManager.error(`Account loading failed: ${err.message}`);
    });
  }

  onRecallClick(accountId: string) {
    this.setState({
      isLoginOpen: true,
      recallingForAccountId: accountId,
    });
  }

  onBreakClick(accountId: string) {
    this.setState({
      isLoginOpen: true,
      breakingGrantToAccountId: accountId,
    });
  }

  onSetLevelClick(currentLevel: number) {
    this.setState({
      isLoginOpen: true,
      changingProxyLevel: true,
    });
  }

  renderGrants(grants: GrantInfoType[]) {
    const show = { display: SHOW_BREAKS };
    return (
      <GrantsTable>
        <GrantsTHead>
          <tr>
            <th>
              <AccountNameStyled account={{ id: 'Validator/proxy', golosId: 'username' }} />
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
          {grants.map(
            ({ accountId, username, share, pct, breakFee, breakMinStaked, isCanceled }) => (
              <GrantItem key={accountId}>
                <td>
                  <GrantRecipient strike={isCanceled && share === 0 && pct === 0}>
                    <AccountNameStyled account={{ id: accountId, golosId: username }} />
                  </GrantRecipient>
                </td>
                <td>{share > 0 ? '≥' + formatCyber(share) : 0}</td>
                <td>{pct > 0 ? formatPct(pct) : '–'}</td>
                <td style={show}>{breakFee < 10000 ? `>${formatPct(breakFee)}` : 'no'}</td>
                <td style={show}>
                  {breakMinStaked > 0 ? `<${formatCyber(breakMinStaked)}` : 'no'}
                </td>
                <td>
                  {share === 0 ? null : (
                    <RecallButton onClick={() => this.onRecallClick(accountId)}>
                      Recall
                    </RecallButton>
                  )}
                  {share > 0 || pct === 0 ? null : (
                    <BreakButton onClick={() => this.onBreakClick(accountId)}>Break</BreakButton>
                  )}
                </td>
              </GrantItem>
            )
          )}
        </GrantsTBody>
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
    const minStake = agent.minStake || 0;

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

  onLogin = async (auth: AuthType) => {
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

  render() {
    const { accountId, account, accountError, mode } = this.props;
    const { isLoginOpen } = this.state;

    return (
      <Wrapper>
        <Title>Account</Title>
        <Info>
          <Field line>
            <FieldTitle>Account id:</FieldTitle> <FieldValue>{accountId}</FieldValue>
          </Field>
          {account ? (
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
        <AccountTransactions accountId={accountId} mode={mode || 'all'} />
        {isLoginOpen ? (
          <LoginDialog
            account={account || { id: accountId, keys: null }}
            lockAccountId
            onLogin={this.onLogin}
            onClose={this.onLoginClose}
          />
        ) : null}
      </Wrapper>
    );
  }
}
