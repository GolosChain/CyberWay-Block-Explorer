import React, { PureComponent } from 'react';
import styled from 'styled-components';
import JSONPretty from 'react-json-pretty';

import { AuthLine, TransactionAction } from '../../types';

import { Field, FieldTitle, FieldValue } from '../Form';

const Wrapper = styled.div`
  padding: 5px 12px 10px;
  margin: 8px 0;
  background: #f2f2f2;
`;

const ArgsBlock = styled.div``;

const EventsBlock = styled.div`
  margin-top: 10px;
`;

const ToggleEvents = styled.button`
  display: inline;
  border: none;
  color: #00f;
  background: none;
  cursor: pointer;
`;

const EventBlock = styled.div`
  margin-top: 6px;
`;

type Props = {
  action: TransactionAction;
};

type State = {
  isEventsCollapsed: boolean;
};

export default class ActionBody extends PureComponent<Props, State> {
  state = {
    isEventsCollapsed: true,
  };

  onToggleClick = () => {
    this.setState(state => ({
      isEventsCollapsed: !state.isEventsCollapsed,
    }));
  };

  render() {
    const { action } = this.props;
    const { isEventsCollapsed } = this.state;

    return (
      <Wrapper key={action.index}>
        <Field line>
          <FieldTitle>Index:</FieldTitle> <FieldValue>{action.index}</FieldValue>
        </Field>
        <Field line>
          <FieldTitle>Action:</FieldTitle>{' '}
          <FieldValue>
            {action.code} :: {action.action}
          </FieldValue>
        </Field>
        <Field line>
          <FieldTitle>Receiver:</FieldTitle> <FieldValue>{action.receiver}</FieldValue>
        </Field>
        <Field line>
          <FieldTitle>Authorization:</FieldTitle> {renderActors(action.auth)}
        </Field>
        <ArgsBlock>
          <FieldTitle>Arguments:</FieldTitle>
          {action.args ? <JSONPretty json={action.args} /> : null}
        </ArgsBlock>
        {action.events && action.events.length ? (
          <EventsBlock>
            <FieldTitle>
              Events ({action.events.length}):{' '}
              <ToggleEvents onClick={this.onToggleClick}>
                {isEventsCollapsed ? 'show all' : 'hide'}
              </ToggleEvents>
            </FieldTitle>
            {isEventsCollapsed
              ? null
              : action.events.map((event, index) => (
                  <EventBlock>
                    Event #{index + 1}:
                    <JSONPretty json={event} />
                  </EventBlock>
                ))}
          </EventsBlock>
        ) : null}
      </Wrapper>
    );
  }
}

function renderActors(auth: AuthLine[]) {
  return auth.map(auth => `${auth.actor}@${auth.permission}`).join(', ');
}
