import React, { PureComponent } from 'react';
import styled from 'styled-components';
// @ts-ignore
import is from 'styled-is';

import { BlockSummary } from '../../types';
import { Field, FieldTitle, FieldValue, Id } from '../Form';
import Transactions from '../Transactions';

const Wrapper = styled.div`
  margin: 16px;
`;

const Colored: any = styled.span`
  color: #24a624;

  ${is('bad')`
    color: #f00;    
  `};
`;

type Props = {
  blockId: string;
  block: BlockSummary | null;
  loadBlock: Function;
};

export default class Block extends PureComponent<Props> {
  componentDidMount() {
    const { blockId } = this.props;

    this.props.loadBlock({ blockId });
  }

  render() {
    const { blockId, block } = this.props;

    return (
      <Wrapper>
        <h1>Block</h1>
        <Field>
          <FieldTitle>Block id:</FieldTitle>
          <FieldValue>
            <Id bold>{blockId}</Id>
          </FieldValue>
        </Field>
        {block ? (
          <>
            <Field>
              <FieldTitle>Parent id:</FieldTitle>
              <FieldValue>
                <Id>{block.parentId}</Id>
              </FieldValue>
            </Field>
            <Field>
              <FieldTitle>Block num:</FieldTitle>
              <FieldValue>{block.blockNum}</FieldValue>
            </Field>
            <Field>
              <FieldTitle>Block time:</FieldTitle>
              <FieldValue>{block.blockTime}</FieldValue>
            </Field>
            <Field>
              <FieldTitle>Transactions (total/executed/expired) count:</FieldTitle>
              <FieldValue>
                {block.counters.transactions.total}/
                <Colored>{block.counters.transactions.executed}</Colored>/
                <Colored bad>{block.counters.transactions.expired}</Colored>
              </FieldValue>
            </Field>
          </>
        ) : null}
        <Transactions blockId={blockId} />
      </Wrapper>
    );
  }
}
