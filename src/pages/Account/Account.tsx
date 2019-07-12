import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { last } from 'ramda';
import InfiniteScroll from 'react-infinite-scroller';
import ToastsManager from 'toasts-manager';

import { AccountType } from '../../types';
import { Field, FieldTitle, FieldValue } from '../../components/Form';
import AccountActions from '../../components/AccountActions';
import { LoadAccountParams } from './Account.connect';

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
  isLoading: boolean;
  isEnd: boolean;
  account: AccountType | null;
  loadAccount: (params: LoadAccountParams) => any;
};

export default class Account extends PureComponent<Props> {
  componentDidMount() {
    const { accountId, loadAccount } = this.props;

    loadAccount({ accountId }).catch((err: Error) => {
      ToastsManager.error(`Failed: ${err.message}`);
    });
  }

  onNeedLoadMore = () => {
    const { accountId, loadAccount, account } = this.props;

    if (!account || account.transactions.length === 0) {
      return;
    }

    const lastTrx = last(account.transactions);

    loadAccount({ accountId, afterTrxId: lastTrx.id }).catch((err: Error) => {
      ToastsManager.error(`Failed: ${err.message}`);
    });
  };

  render() {
    const { accountId, account, isLoading, isEnd } = this.props;

    return (
      <Wrapper>
        <Title>Account</Title>
        <Info>
          <Field>
            <FieldTitle>Account id:</FieldTitle>
            <FieldValue>{accountId}</FieldValue>
          </Field>
        </Info>
        {account ? (
          <InfiniteScroll hasMore={!isEnd && !isLoading} loadMore={this.onNeedLoadMore}>
            <AccountActions accountId={accountId} transactions={account.transactions} />
          </InfiniteScroll>
        ) : (
          'Loading ...'
        )}
      </Wrapper>
    );
  }
}
