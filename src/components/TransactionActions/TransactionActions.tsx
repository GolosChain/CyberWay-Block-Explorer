import React, { PureComponent } from 'react';
import styled from 'styled-components';

import { TransactionAction } from '../../types';

const Wrapper = styled.div`
  margin-top: 20px;
`;

const SubTitle = styled.h2``;

const List = styled.ol``;

const Action = styled.li`
  margin: 8px 0;
`;

const ActionIndex = styled.span``;

type Props = {
  actions: TransactionAction[];
};

export default class TransactionActions extends PureComponent<Props> {
  renderAction = (action: TransactionAction, i: number) => {
    return (
      <Action key={i}>
        <ActionIndex>Action ({i + 1}):</ActionIndex>
        <pre>{JSON.stringify(action, null, 2)}</pre>
      </Action>
    );
  };

  render() {
    const { actions } = this.props;

    return (
      <Wrapper>
        <SubTitle>Actions ({actions.length})</SubTitle>
        <List>{actions.map(this.renderAction)}</List>
      </Wrapper>
    );
  }
}