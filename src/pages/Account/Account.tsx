import React, { PureComponent } from 'react';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';

import { AccountType } from '../../types';
import { Field, FieldTitle, FieldValue } from '../../components/Form';
import AccountTransactions from '../../components/AccountTransactions';

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
  account: AccountType | null;
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
    const { accountId } = this.props;

    return (
      <Wrapper>
        <Title>Account</Title>
        <Info>
          <Field>
            <FieldTitle>Account id:</FieldTitle>
            <FieldValue>{accountId}</FieldValue>
          </Field>
        </Info>
        <AccountTransactions accountId={accountId} />
      </Wrapper>
    );
  }
}
