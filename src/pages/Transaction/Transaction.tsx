import React, { PureComponent } from 'react';
import styled from 'styled-components';
// @ts-ignore
import is from 'styled-is';

import { FiltersType, TransactionType } from '../../types';

import { Field, FieldTitle, FieldValue, Id } from '../../components/Form';
import TransactionActions from '../../components/TransactionActions';

const Wrapper = styled.div`
  margin: 16px;
`;

const Title = styled.h1``;

const Status = styled.span<{ expired: boolean }>`
  ${is('expired')`
    color: #f00;
  `}
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
    const { transactionId, filters, loadTransaction } = this.props;

    const query = {
      transactionId,
      ...filters,
    };

    loadTransaction(query);
  }

  render() {
    const { transactionId, transaction, filters } = this.props;

    return (
      <Wrapper>
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
                <Id>{transaction.blockId}</Id>
              </FieldValue>
            </Field>
            <Field>
              <FieldTitle>Block num:</FieldTitle>
              <FieldValue>
                <Id>{transaction.blockNum}</Id>
              </FieldValue>
            </Field>
            <Field>
              <FieldTitle>Block time:</FieldTitle>
              <FieldValue>
                <Id>{transaction.blockTime}</Id>
              </FieldValue>
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
