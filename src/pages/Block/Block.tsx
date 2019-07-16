import React, { PureComponent } from 'react';
import styled from 'styled-components';

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

  renderCounters(counters: { [key: string]: number }) {
    const parts = [];

    for (const key of Object.keys(counters)) {
      if (key !== 'executed' && key !== 'total') {
        parts.push(`, ${key}: ${counters[key]}`);
      }
    }

    const executedString = String(counters.executed || 0);

    if (parts.length) {
      parts.unshift(`executed: ${executedString}`);
    } else {
      parts.push(executedString);
    }

    return parts;
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
              <FieldTitle>Transactions count:</FieldTitle>
              <FieldValue>{this.renderCounters(block.counters.transactions)}</FieldValue>
            </Field>
          </>
        ) : null}
        <Transactions blockId={blockId} />
      </Wrapper>
    );
  }
}
