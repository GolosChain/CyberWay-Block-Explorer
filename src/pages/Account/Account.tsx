import React, { PureComponent } from 'react';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';

import { AccountTransactionsMode, AccountType, ApiError, GrantInfoType } from '../../types';
import { Field, FieldTitle, FieldValue, ErrorLine } from '../../components/Form';
import AccountTransactions from '../../components/AccountTransactions';
import AccountKeys from '../../components/AccountKeys';

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

const GrantRecipient = styled.span``;

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
};

export default class Account extends PureComponent<Props> {
  componentDidMount() {
    const { accountId, loadAccount } = this.props;

    loadAccount(accountId).catch((err: Error) => {
      ToastsManager.error(`Account loading failed: ${err.message}`);
    });
  }

  onRecallClick(accountId: string) {
    console.log('A', accountId);
  }

  renderGrants(grants: GrantInfoType[]) {
    return (
      <ul>
        {grants.map(({ accountId, username }) => (
          <GrantItem key={accountId}>
            <GrantRecipient>
              {accountId}
              {username ? <Username> ({username}@@gls)</Username> : null}
            </GrantRecipient>
            <RecallButton onClick={() => this.onRecallClick(accountId)}>Recall</RecallButton>
          </GrantItem>
        ))}
      </ul>
    );
  }

  render() {
    const { accountId, account, accountError, mode } = this.props;

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
                <Field>
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
      </Wrapper>
    );
  }
}
