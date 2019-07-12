import React, { PureComponent } from 'react';
import styled from 'styled-components';

import { TransactionType, TransactionAction } from '../../types';
import ActionBody from '../ActionBody';
import Link from '../Link';
import { Id } from '../Form';

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
  accountId: string;
  transactions: TransactionType[];
  className?: string;
};

export default class AccountActions extends PureComponent<Props> {
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
    const { transactions, className } = this.props;

    return (
      <Wrapper className={className}>
        <ListTitle>Actions history:</ListTitle>
        <ListWrapper>
          <List>{transactions.map(transaction => this.renderTransaction(transaction))}</List>
        </ListWrapper>
      </Wrapper>
    );
  }
}
