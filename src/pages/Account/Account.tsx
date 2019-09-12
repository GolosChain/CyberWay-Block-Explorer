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

  renderGrants(grants: GrantInfoType[]) {
    const grantItems = [];
    for (const grant of grants) {
      // TODO: recall button
      grantItems.push(
        <li>{grant.recipient_name}</li>
      );
    }
    return <ul>{grantItems}</ul>;
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
                {account.grants.items.length ? this.renderGrants(account.grants.items) : <span>none</span>}
                <br/>
                <small>Updated: {new Date(account.grants.updateTime).toLocaleString()}</small>
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
