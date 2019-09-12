import React, { PureComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import ToastsManager from 'toasts-manager';

import {
  AccountTransactionsMode,
  AccountType,
  ApiError,
  GrantInfoType,
  AuthType,
} from '../../types';
import { Field, FieldTitle, FieldValue, ErrorLine } from '../../components/Form';
import AccountTransactions from '../../components/AccountTransactions';
import AccountKeys from '../../components/AccountKeys';
import LoginDialog from '../../components/LoginDialog';
import { recall } from '../../utils/cyberway';

const Wrapper = styled.div`
  margin: 16px;
`;

const Title = styled.h1`
  margin: 12px 0;
`;

const Info = styled.div`
  margin-bottom: 20px;
`;

const GrantItem = styled.li`
  margin: 3px 0;
`;

const GrantRecipient = styled.span<{ strike?: boolean }>`
  ${is('strike')`
    text-decoration: line-through;
  `};
`;

const Username = styled.span`
  color: #888;
  font-size: 14px;
`;

const RecallButton = styled.button`
  margin-left: 10px;
  font-size: 14px;
  border-radius: 4px;
  color: #333;
  background: #eee;
  cursor: pointer;
`;

const UpdatedAt = styled.div`
  margin-top: 4px;
  font-size: 13px;
`;

export type Props = {
  accountId: string;
  mode: AccountTransactionsMode | undefined;
  account: AccountType | null;
  accountError: ApiError | null;
  loadAccount: (accountId: string) => any;
  markGrantAsCanceled: (params: any) => void;
};

export default class Account extends PureComponent<Props> {
  state = {
    password: '',
    isLoginOpen: false,
    recallingForAccountId: null,
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

  renderGrants(grants: GrantInfoType[]) {
    return (
      <ul>
        {grants.map(({ accountId, username, isCanceled }) => (
          <GrantItem key={accountId}>
            <GrantRecipient strike={isCanceled}>
              {accountId}
              {username ? <Username> ({username}@@gls)</Username> : null}
            </GrantRecipient>
            {isCanceled ? null : (
              <RecallButton onClick={() => this.onRecallClick(accountId)}>Recall</RecallButton>
            )}
          </GrantItem>
        ))}
      </ul>
    );
  }

  onLogin = async (auth: AuthType) => {
    const { markGrantAsCanceled } = this.props;
    const { recallingForAccountId } = this.state;

    try {
      await recall({ auth, recipientId: recallingForAccountId as any });
      ToastsManager.info('Success');

      this.onLoginClose();

      markGrantAsCanceled({ accountId: auth.accountId, recipientId: recallingForAccountId });
    } catch (err) {
      ToastsManager.error(err.message);
    }
  };

  onLoginClose = () => {
    this.setState({
      isLoginOpen: false,
      password: '',
      recallingForAccountId: null,
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
              {account.keys ? (
                <Field>
                  <FieldTitle>Keys:</FieldTitle>
                  <AccountKeys keys={account.keys} />
                </Field>
              ) : null}
              {account.grants ? (
                <Field as="div">
                  <FieldTitle>Grants:</FieldTitle>
                  {account.grants.items.length ? (
                    this.renderGrants(account.grants.items)
                  ) : (
                    <span>none</span>
                  )}
                  <UpdatedAt>
                    Updated: {new Date(account.grants.updateTime).toLocaleString()}
                  </UpdatedAt>
                </Field>
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
            accountId={accountId}
            lockAccountId
            onLogin={this.onLogin}
            onClose={this.onLoginClose}
          />
        ) : null}
      </Wrapper>
    );
  }
}
