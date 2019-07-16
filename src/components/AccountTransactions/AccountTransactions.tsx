import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { equals } from 'ramda';
import InfiniteScroll from 'react-infinite-scroller';
import ToastsManager from 'toasts-manager';

import {
  TransactionType,
  TransactionAction,
  FiltersType,
  AccountTransactionsMode,
} from '../../types';
import ActionBody from '../ActionBody';
import Link from '../Link';
import { Id } from '../Form';
import InlineSwitch from '../InlineSwitch';
import CurrentFilters from '../CurrentFilters';
import { LOAD_TRANSACTIONS_PARAMS_TYPE } from './AccountTransactions.connect';

const Wrapper = styled.div``;
const ListTitle = styled.h2``;

const ListWrapper = styled.div`
  display: flex;
`;

const List = styled.ul`
  padding: 10px 0;
  flex-shrink: 0;
`;

const Item = styled.li``;

const Transaction = styled.div`
  padding: 10px 16px;
  margin-bottom: 10px;
  border: 1px solid #999;
`;

const TransactionId = styled.div``;

const Line = styled.div`
  margin: 4px 0;
`;

type Props = {
  accountId: string;
  mode: AccountTransactionsMode;
  filters: FiltersType;
  currentFilters: FiltersType;
  transactions: TransactionType[] | null;
  sequenceKey: string | null;
  isLoading: boolean;
  loadAccountTransactions: (params: LOAD_TRANSACTIONS_PARAMS_TYPE) => any;
};

export default class AccountTransactions extends PureComponent<Props> {
  componentDidMount() {
    this.loadData();
  }

  componentWillReceiveProps(nextProps: Readonly<Props>) {
    const props = this.props;

    if (!equals(props.filters, nextProps.filters) || props.mode !== nextProps.mode) {
      setTimeout(() => {
        this.loadData();
      });
    }
  }

  loadData(sequenceKey?: string) {
    const { accountId, mode, filters, loadAccountTransactions } = this.props;

    loadAccountTransactions({ accountId, mode, sequenceKey, ...filters }).catch((err: Error) => {
      ToastsManager.error(`Account transactions loading failed: ${err.message}`);
    });
  }

  onNeedLoadMore = () => {
    const { sequenceKey } = this.props;
    this.loadData(sequenceKey || undefined);
  };

  renderTransaction(transaction: TransactionType) {
    const { accountId } = this.props;

    const actions = transaction.actions
      .filter(
        action =>
          action.auth.some(({ actor }) => actor === accountId) ||
          action.accounts.includes(accountId)
      )
      .map(action => this.renderAction(action));

    return (
      <Transaction key={transaction.id}>
        <TransactionId>
          <Line>
            Block:{' '}
            <Link to={`/block/${transaction.blockId}`} keepHash>
              <Id>#{transaction.blockNum}</Id>
            </Link>
          </Line>
          <Line>Timestamp: {new Date(transaction.blockTime).toLocaleString()}</Line>
          <Line>
            Transaction:{' '}
            <Link to={`/trx/${transaction.id}`} keepHash>
              <Id compact>{transaction.id}</Id>
            </Link>
          </Line>
        </TransactionId>
        {actions}
      </Transaction>
    );
  }

  renderAction(action: TransactionAction) {
    return (
      <Item key={action.index}>
        <ActionBody action={action} />
      </Item>
    );
  }

  render() {
    const { transactions, currentFilters, sequenceKey, accountId, isLoading } = this.props;

    return (
      <Wrapper>
        <ListTitle>
          Actions history:{' '}
          <InlineSwitch
            options={[
              {
                to: `/account/${accountId}`,
                label: 'all',
              },
              {
                to: `/account/${accountId}/actor`,
                label: 'actor',
              },
              {
                to: `/account/${accountId}/mention`,
                label: 'mention',
              },
            ]}
          />
        </ListTitle>
        <CurrentFilters filters={currentFilters} />
        <ListWrapper>
          {transactions && transactions.length ? (
            <InfiniteScroll
              hasMore={Boolean(sequenceKey) && !isLoading}
              loadMore={this.onNeedLoadMore}
            >
              <List>{transactions.map(transaction => this.renderTransaction(transaction))}</List>
            </InfiniteScroll>
          ) : isLoading ? (
            'Loading ...'
          ) : currentFilters ? (
            'Nothing is found'
          ) : (
            'No transactions'
          )}
        </ListWrapper>
      </Wrapper>
    );
  }
}
