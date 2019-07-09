import React, { PureComponent } from 'react';
import styled from 'styled-components';
import JSONPretty from 'react-json-pretty';

import { FiltersType, TransactionAction } from '../../types';
import CurrentFilters from '../CurrentFilters';

const Wrapper = styled.div`
  display: flex;
  margin-top: 20px;
`;

const Container = styled.div``;

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
        <JSONPretty json={{ ...action, index: undefined }} />
      </Action>
    );
  };

  render() {
    const { actions, filters } = this.props;

    console.log('render', filters);

    let resultActions = actions;

    if ([...Object.keys(filters)].some(key => key !== 'status' && (filters as any)[key])) {
      resultActions = resultActions.filter(action => {
        if (filters.code && filters.action) {
          return action.code === filters.code && action.action === filters.action;
        } else if (filters.code) {
          return action.code === filters.code;
        } else if (filters.action) {
          return action.action === filters.action;
        } else if (filters.event) {
          return action.events && action.events.some(event => event.event === filters.event);
        } else if (filters.actor) {
          const { auth } = action;

          if (!auth) {
            return false;
          }

          if (filters.actor.includes('/')) {
            const [actorId, permission] = filters.actor.split('/');
            return actorId === auth.actor && permission === auth.permission;
          } else {
            return auth.actor === filters.actor;
          }
        }

        return false;
      });
    }

    return (
      <Wrapper>
        <Container>
          <SubTitle>Actions ({actions.length})</SubTitle>
          <CurrentFilters filters={filters} />
          <List>{resultActions.map(this.renderAction)}</List>
        </Container>
      </Wrapper>
    );
  }
}
