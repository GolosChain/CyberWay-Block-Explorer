import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { FiltersType } from '../../types';

const FILTERS = [
  {
    id: 'code',
  },
  {
    id: 'action',
  },
  {
    id: 'actor',
  },
  {
    id: 'event',
  },
  {
    id: 'nonEmpty',
    text: 'Non empty',
  },
];

const Wrapper = styled.div`
  padding: 8px 12px;
  margin: 4px 0 8px;
  border-radius: 8px;
  background: #bcffd0;
`;

const Title = styled.span`
  margin-right: 6px;
`;

const Item = styled.span`
  margin-right: 4px;
`;

type Props = {
  filters: FiltersType | null;
};

export default class CurrentFilters extends PureComponent<Props> {
  renderItem = ({ id, text }: { id: string; text?: string }) => {
    const { filters } = this.props;

    const value: string | boolean | undefined = (filters as any)[id];

    const label = text || id;

    if (value) {
      return <Item key={id}>{value === true ? label : `${label}: ${value}`}</Item>;
    }
  };

  render() {
    const { filters } = this.props;

    if (!filters) {
      return null;
    }

    const items = FILTERS.map(this.renderItem);

    if (!items.some(Boolean)) {
      return null;
    }

    return (
      <Wrapper>
        <Title>Current filters: </Title>
        {items}
      </Wrapper>
    );
  }
}
