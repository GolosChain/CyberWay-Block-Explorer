import React, { PureComponent } from 'react';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';

import { AccountTransactionsMode, AccountType, ApiError } from '../../types';
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
              <Field>
                <FieldTitle>Keys:</FieldTitle>
                <AccountKeys keys={account.keys} />
              </Field>
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
