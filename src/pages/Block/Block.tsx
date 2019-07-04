import React, { PureComponent } from 'react';
import styled from 'styled-components';
// @ts-ignore
import is from 'styled-is';

import { BlockSummary } from '../../types';
import { Field, FieldTitle, FieldValue, Id } from '../../components/Form';
import Transactions from '../../components/Transactions';
import Navigation from '../../components/Navigation';
import Link from '../../components/Link';

const Wrapper = styled.div`
  margin: 16px;
`;

const Title = styled.h1`
  margin: 12px 0;
`;

const Colored = styled.span<{ bad?: boolean }>`
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
        <Navigation
          items={[
            {
              text: 'Feed',
              url: '/feed/',
            },
            {
              text: `Block${block ? ` (${block.blockNum})` : ''}`,
            },
          ]}
        />
        <Title>Block</Title>
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
                <Link to={`/block/${block.parentId}`} keepHash>
                  <Id>{block.parentId}</Id>
                </Link>
              </FieldValue>
            </Field>
            <Field>
              <FieldTitle>Block num:</FieldTitle>
              <FieldValue>{block.blockNum}</FieldValue>
            </Field>
            <Field>
              <FieldTitle>Block time:</FieldTitle>
              <FieldValue>{new Date(block.blockTime).toLocaleString()}</FieldValue>
            </Field>
            <Field>
              <FieldTitle>Transactions (total/executed/expired) count:</FieldTitle>
              <FieldValue>
                {block.counters.transactions.total}/
                <Colored>{block.counters.transactions.executed}</Colored>/
                <Colored bad>{block.counters.transactions.expired || 0}</Colored>
              </FieldValue>
            </Field>
          </>
        ) : null}
        <Transactions blockId={blockId} />
      </Wrapper>
    );
  }
}
