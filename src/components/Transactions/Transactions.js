import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import is from 'styled-is';
import { last } from 'ramda';
import InfiniteScroll from 'react-infinite-scroller';

import InlineSwitch from '../InlineSwitch';

const FILTER_STORAGE_KEY = 'executed';

const Wrapper = styled.div`
  margin-top: 40px;
`;

const SubTitle = styled.h2`
  margin-bottom: 8px;
`;

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

const StatusText = styled.span`
  color: #24a624;

  ${is('expired')`
    color: #f00;
  `}
`;

export default class Transactions extends PureComponent {
  state = {
    showOnlyExecuted: true,
    filter: localStorage.getItem(FILTER_STORAGE_KEY) || 'all',
  };

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    const { blockId, loadTransactions } = this.props;
    const { filter } = this.state;

    loadTransactions({ blockId, status: filter });
  }

  onLoadMore = () => {
    const { isLoading, isEnd, transactions, blockId, loadTransactions } = this.props;
    const { filter } = this.state;

    if (isLoading || isEnd || transactions.length === 0) {
      return;
    }

    const { index } = last(transactions);

    loadTransactions({ blockId, status: filter, fromIndex: index });
  };

  onFilterChange = value => {
    this.setState(
      {
        filter: value,
      },
      () => {
        this.loadData();
      }
    );

    localStorage.setItem(FILTER_STORAGE_KEY, value);
  };

  renderTransactionLine = transaction => {
    return (
      <Item key={transaction.id}>
        <LinkStyled to={`/trx/${transaction.id}`}>
          <TransactionIndex>({transaction.index + 1})</TransactionIndex>{' '}
          <TransactionId>{transaction.id}</TransactionId>{' '}
          <StatusText expired={transaction.status === 'expired'}>{transaction.status}</StatusText>{' '}
        </LinkStyled>
      </Item>
    );
  };

  render() {
    const { transactions } = this.props;
    const { filter } = this.state;

    return (
      <Wrapper>
        <SubTitle>
          Transactions{' '}
          <InlineSwitch
            value={filter}
            options={['all', 'executed', 'expired']}
            onChange={this.onFilterChange}
          />
        </SubTitle>
        {transactions.length ? (
          <InfiniteScroll hasMore={true} loadMore={this.onLoadMore}>
            <List>{transactions.map(this.renderTransactionLine)}</List>
          </InfiniteScroll>
        ) : (
          'No transactions'
        )}
      </Wrapper>
    );
  }
}
