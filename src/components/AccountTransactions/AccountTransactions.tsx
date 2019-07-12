import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { equals, last } from 'ramda';
import InfiniteScroll from 'react-infinite-scroller';
import ToastsManager from 'toasts-manager';

import {
  TransactionType,
  TransactionAction,
  AccountTransactionsType,
  FiltersType,
} from '../../types';
import ActionBody from '../ActionBody';
import Link from '../Link';
import { Id } from '../Form';
import InlineSwitch from '../InlineSwitch';
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
  margin-bottom: 5px;
  border: 1px solid #999;
`;

const TransactionId = styled.div``;

const Line = styled.div`
  margin: 4px 0;
`;

type Props = {
  filters: FiltersType;
  accountId: string;
  transactions: TransactionType[] | null;
  isEnd: boolean;
  isLoading: boolean;
  changeType: Function;
  loadAccountTransactions: (params: LOAD_TRANSACTIONS_PARAMS_TYPE) => any;
};

export default class AccountTransactions extends PureComponent<Props> {
  componentDidMount() {
    this.loadData();
  }

  componentWillReceiveProps(nextProps: Readonly<Props>) {
    const props = this.props;

    if (!equals(props.filters, nextProps.filters)) {
      setTimeout(() => {
        this.loadData();
      });
    }
  }

  loadData() {
    const { accountId, filters, loadAccountTransactions } = this.props;

    loadAccountTransactions({ accountId, type: filters.type }).catch((err: Error) => {
      ToastsManager.error(`Account transactions loading failed: ${err.message}`);
    });
  }

  onTypeChange = (type: AccountTransactionsType) => {
    const { changeType } = this.props;
    changeType(type);
  };

  onNeedLoadMore = () => {
    const { accountId, transactions, loadAccountTransactions } = this.props;

    if (!transactions || transactions.length === 0) {
      return;
    }

    const lastTrx = last(transactions);

    loadAccountTransactions({ accountId, afterTrxId: lastTrx.id }).catch((err: Error) => {
      ToastsManager.error(`Failed: ${err.message}`);
    });
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
    const { transactions, filters, isEnd, isLoading } = this.props;

    return (
      <Wrapper>
        <ListTitle>
          Actions history:{' '}
          <InlineSwitch
            value={filters.type || 'all'}
            options={['all', 'actor', 'mention']}
            onChange={this.onTypeChange}
          />
        </ListTitle>
        <ListWrapper>
          {transactions ? (
            <InfiniteScroll hasMore={!isEnd && !isLoading} loadMore={this.onNeedLoadMore}>
              <List>{transactions.map(transaction => this.renderTransaction(transaction))}</List>
            </InfiniteScroll>
          ) : (
            'Loading ...'
          )}
        </ListWrapper>
      </Wrapper>
    );
  }
}
