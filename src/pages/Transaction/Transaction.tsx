import React, { PureComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';

import { FiltersType, TransactionType } from '../../types';

import Navigation from '../../components/Navigation';
import { Field, FieldTitle, FieldValue, Id } from '../../components/Form';
import TransactionActions from '../../components/TransactionActions';
import Link from '../../components/Link';

const Wrapper = styled.div`
  margin: 16px;
`;

const Title = styled.h1`
  margin: 12px 0;
`;

const Status = styled.span<{ expired: boolean }>`
  ${is('expired')`
    color: #f00;
  `};
`;

type Props = {
  transactionId: string;
  transaction: TransactionType | null;
  filters: FiltersType;
  loadTransaction: Function;
};

export default class Transaction extends PureComponent<Props> {
  componentDidMount() {
    this.load();
  }

  load() {
    const { transactionId, loadTransaction } = this.props;

    loadTransaction({
      transactionId,
    });
  }

  render() {
    const { transactionId, transaction, filters } = this.props;

    return (
      <Wrapper>
        <Navigation
          items={[
            {
              text: 'Feed',
              url: '/feed/',
            },
            {
              text: `Block${transaction ? ` (${transaction.blockNum})` : ''}`,
              url: transaction ? `/block/${transaction.blockId}` : null,
            },
            {
              text: 'Transaction',
            },
          ]}
        />
        <Title>Transaction</Title>
        <Field>
          <FieldTitle>Transaction id:</FieldTitle>
          <FieldValue>
            <Id bold>{transactionId}</Id>
          </FieldValue>
        </Field>
        {transaction ? (
          <>
            <Field>
              <FieldTitle>Block id:</FieldTitle>
              <FieldValue>
                <Link to={`/block/${transaction.blockId}`} keepHash>
                  <Id>{transaction.blockId}</Id>
                </Link>
              </FieldValue>
            </Field>
            <Field>
              <FieldTitle>Block num:</FieldTitle>
              <FieldValue>
                <Link to={`/block/${transaction.blockId}`} keepHash>
                  <Id>{transaction.blockNum}</Id>
                </Link>
              </FieldValue>
            </Field>
            <Field>
              <FieldTitle>Block time:</FieldTitle>
              <FieldValue>{new Date(transaction.blockTime).toLocaleString()}</FieldValue>
            </Field>
            <Field>
              <FieldTitle>Transaction status:</FieldTitle>
              <FieldValue>
                <Status expired={transaction.status === 'expired'}>{transaction.status}</Status>
              </FieldValue>
            </Field>
            <Field>
              <FieldTitle>Statistics:</FieldTitle>
              <FieldValue>{JSON.stringify(transaction.stats, null, 2)}</FieldValue>
            </Field>
            <TransactionActions actions={transaction.actions} filters={filters} />
          </>
        ) : null}
      </Wrapper>
    );
  }
}
