import React, { PureComponent } from 'react';
import styled from 'styled-components';
import JSONPretty from 'react-json-pretty';

import { FiltersType, TransactionAction } from '../../types';

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
  filters: FiltersType;
};

export default class TransactionActions extends PureComponent<Props> {
  renderAction = (action: TransactionAction) => {
    return (
      <Action key={action.index}>
        <ActionIndex>Action ({action.index}):</ActionIndex>
        <JSONPretty json={action} />
      </Action>
    );
  };

  render() {
    const { actions, filters } = this.props;

    let resultActions = actions;

    if (filters.code || filters.action) {
      resultActions = resultActions.filter(action => {
        if (filters.code && filters.action) {
          return action.code === filters.code && action.action === filters.action;
        } else if (filters.code) {
          return action.code === filters.code;
        } else if (filters.action) {
          return action.action === filters.action;
        }

        return false;
      });
    }

    return (
      <Wrapper>
        <SubTitle>Actions ({actions.length})</SubTitle>
        <List>{resultActions.map(this.renderAction)}</List>
      </Wrapper>
    );
  }
}
