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
          if (action.code !== filters.code || action.action !== filters.action) {
            return false;
          }
        } else if (filters.code) {
          if (action.code !== filters.code) {
            return false;
          }
        } else if (filters.action) {
          if (action.action !== filters.action) {
            return false;
          }
        }

        if (filters.event) {
          if (!action.events || action.events.every(event => event.event !== filters.event)) {
            return false;
          }
        }

        if (filters.actor) {
          const { auth } = action;

          if (!auth) {
            return false;
          }

          let actorId = filters.actor;
          let permission: string | null = null;

          if (filters.actor.includes('/')) {
            [actorId, permission] = filters.actor.split('/');
          }

          const isActorOk = auth.some(auth => {
            if (permission) {
              return actorId === auth.actor && permission === auth.permission;
            } else {
              return actorId === auth.actor;
            }
          });

          if (!isActorOk) {
            return false;
          }
        }

        return true;
      });
    }

    const actionsElements = resultActions.map(action => (
      <Item key={action.index}>
        <Action action={action} />
      </Item>
    ));

    return (
      <Wrapper>
        <Container>
          <SubTitle>Actions ({actionsElements.length})</SubTitle>
          <CurrentFilters filters={filters} />
          <List>{actionsElements}</List>
        </Container>
      </Wrapper>
    );
  }
}
