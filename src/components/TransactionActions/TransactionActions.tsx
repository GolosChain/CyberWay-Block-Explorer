import React, { PureComponent } from 'react';
import styled from 'styled-components';

import { FiltersType, TransactionAction } from '../../types';
import CurrentFilters from '../CurrentFilters';
import Action from '../ActionBody';

const Wrapper = styled.div`
  display: flex;
  margin-top: 20px;
`;

const Container = styled.div``;
const SubTitle = styled.h2``;
const List = styled.ol``;
const Item = styled.li``;

type Props = {
  actions: TransactionAction[];
  filters: FiltersType;
};

export default class TransactionActions extends PureComponent<Props> {
  render() {
    const { actions, filters } = this.props;

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

          let actorId = filters.actor;
          let permission: string | null = null;

          if (filters.actor.includes('/')) {
            [actorId, permission] = filters.actor.split('/');
          }

          return auth.some(auth => {
            if (permission) {
              return actorId === auth.actor && permission === auth.permission;
            } else {
              return actorId === auth.actor;
            }
          });
        }

        return false;
      });
    }

    return (
      <Wrapper>
        <Container>
          <SubTitle>Actions ({actions.length})</SubTitle>
          <CurrentFilters filters={filters} />
          <List>
            {resultActions.map(action => (
              <Item>
                <Action action={action} />
              </Item>
            ))}
          </List>
        </Container>
      </Wrapper>
    );
  }
}
