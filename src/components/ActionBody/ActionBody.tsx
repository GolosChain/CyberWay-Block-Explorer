import React, { PureComponent, Fragment } from 'react';
import styled from 'styled-components';
import JSONPretty from 'react-json-pretty';

import { AuthType, TransactionAction } from '../../types';

import { Field, FieldTitle, FieldValue } from '../Form';
import Link from '../Link';

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
          {action.args ? (
            <>
              <FieldTitle>Arguments:</FieldTitle>
              <JSONPretty json={action.args} />
            </>
          ) : action.data ? (
            <>
              <FieldTitle>Data:</FieldTitle>
              <div>{action.data}</div>
            </>
          ) : null}
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
                  <EventBlock key={index}>
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

function renderActors(auth: AuthType[]) {
  return auth.map((auth, index) => (
    <Fragment key={index}>
      <Link to={`/account/${auth.actor}`}>{auth.actor}</Link>@{auth.permission}
    </Fragment>
  ));
}
