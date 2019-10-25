import React, { PureComponent } from 'react';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroller';
import ToastsManager from 'toasts-manager';

import { TokenBalanceType } from '../../types';
import { LOAD_BALANCES_PARAMS_TYPE } from './TokenHolders.connect';
import AccountName from '../AccountName';

const Wrapper = styled.div`
  margin-top: 12px;
  padding-bottom: 80px;
`;

const Title = styled.h2`
  font-size: 20px;
`;

const Table = styled.table`
  margin: 8px 0;
  border: 1px solid #999;

  & tbody tr:hover {
    background: #ffe;
  }
  & th {
    background: #eee;
  }
  & td,
  & th {
    padding: 2px 3px;
  }
  & td:nth-child(3),
  & td:nth-child(4),
  & td:last-child {
    text-align: right;
  }
  & td:nth-child(3) {
    font-family: monospace;
  }
`;

type Props = {
  symbol: string;
  supply: number;
  items: TokenBalanceType[] | null;
  offset: number | null;
  isLoading: boolean;
  loadTokenBalances: (params: LOAD_BALANCES_PARAMS_TYPE) => any;
};

export default class TokenHolders extends PureComponent<Props> {
  componentDidMount() {
    this.loadData();
  }

  loadData(offset?: number) {
    const { symbol, loadTokenBalances } = this.props;

    loadTokenBalances({ symbol, offset }).catch((err: Error) => {
      ToastsManager.error(`Token balances loading failed: ${err.message}`);
    });
  }

  onNeedLoadMore = () => {
    const { offset } = this.props;
    this.loadData(offset || undefined);
  };

  render() {
    const { supply, items, offset, isLoading } = this.props;
    let sum = 0;

    return (
      <Wrapper>
        <Title>Top balances:</Title>
        {items && items.length ? (
          <Table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Account</th>
                <th>Quantity</th>
                <th>Percentage</th>
                <th>∑%</th>
              </tr>
            </thead>
            <InfiniteScroll
              hasMore={(offset || 0) < 200 && !isLoading}
              loadMore={this.onNeedLoadMore}
              element="tbody"
            >
              {items.map((holder: TokenBalanceType, idx: number) => {
                const { account, balance } = holder;
                const percent = (100 * parseFloat(balance)) / supply;
                sum += percent;

                return (
                  <tr key={account}>
                    <td>{idx + 1}</td>
                    <td>
                      {account !== undefined ? (
                        <AccountName account={{ id: account }} addLink />
                      ) : (
                        '?'
                      )}
                    </td>
                    <td>{balance.split(' ')[0]}</td>
                    <td>{percent.toFixed(3)}%</td>
                    <td>{sum.toFixed(3)}%</td>
                  </tr>
                );
              })}
            </InfiniteScroll>
          </Table>
        ) : isLoading ? (
          'Loading ...'
        ) : (
          'No balances'
        )}
      </Wrapper>
    );
  }
}
