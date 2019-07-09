import React, { PureComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import { last, equals } from 'ramda';
import InfiniteScroll from 'react-infinite-scroller';

import { FiltersType, TransactionStatus, TransactionType } from '../../types';
import Link from '../Link';
import InlineSwitch from '../InlineSwitch';
import CurrentFilters from '../CurrentFilters';

import { LoadTransactionsParams } from './Transactions.connect';

const Wrapper = styled.div`
  margin-top: 40px;
`;

const SubTitle = styled.h2`
  margin-bottom: 8px;
`;

const ListContainer = styled.div`
  display: flex;
`;

const ListWrapper = styled.div``;

const List = styled.ul``;

const Item = styled.li``;

const LinkStyled = styled(Link)`
  margin: 4px 0;
  font-size: 15px;
  color: unset;
  text-decoration: none;
`;

const TransactionIndex = styled.span`
  font-family: monospace;
  color: #666;
`;

const TransactionId = styled.span`
  font-family: monospace;
`;

const StatusText = styled.span<{ expired: boolean }>`
  color: #24a624;

  ${is('expired')`
    color: #f00;
  `}
`;

type Props = {
  blockId: string;
  isLoading: boolean;
  isEnd: boolean;
  filters: FiltersType;
  currentFilters: FiltersType;
  transactions: TransactionType[];
  setStatusFilter: Function;
  loadTransactions: (arg: LoadTransactionsParams) => void;
};

export default class Transactions extends PureComponent<Props> {
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

  loadData(isMore = false) {
    const { blockId, filters, transactions, loadTransactions } = this.props;
    const query: LoadTransactionsParams = { blockId, ...filters };

    if (isMore) {
      const { index } = last(transactions) as TransactionType;

      query.fromIndex = index;
    }

    loadTransactions(query);
  }

  onLoadMore = () => {
    const { isLoading, isEnd, transactions } = this.props;

    if (isLoading || isEnd || transactions.length === 0) {
      return;
    }

    this.loadData(true);
  };

  onFilterChange = (value: TransactionStatus) => {
    const { setStatusFilter } = this.props;
    setStatusFilter(value);
  };

  renderTransactionLine = (transaction: TransactionType) => {
    return (
      <Item key={transaction.id}>
        <LinkStyled to={`/trx/${transaction.id}`} keepHash>
          <TransactionIndex>({transaction.index + 1})</TransactionIndex>{' '}
          <TransactionId>{transaction.id}</TransactionId>{' '}
          <StatusText expired={transaction.status === 'expired'}>{transaction.status}</StatusText>{' '}
        </LinkStyled>
      </Item>
    );
  };

  render() {
    const { transactions, isLoading, isEnd, currentFilters } = this.props;

    return (
      <Wrapper>
        <SubTitle>
          Transactions{' '}
          <InlineSwitch
            value={currentFilters.status || 'all'}
            options={['all', 'executed', 'expired']}
            onChange={this.onFilterChange}
          />
        </SubTitle>
        <ListContainer>
          <ListWrapper>
            <CurrentFilters filters={currentFilters} />
            {transactions.length ? (
              <InfiniteScroll hasMore={!isEnd} loadMore={this.onLoadMore}>
                <List>{transactions.map(this.renderTransactionLine)}</List>
              </InfiniteScroll>
            ) : isLoading ? (
              'Loading ...'
            ) : currentFilters ? (
              'Nothing is found'
            ) : (
              'No transactions'
            )}
          </ListWrapper>
        </ListContainer>
      </Wrapper>
    );
  }
}
