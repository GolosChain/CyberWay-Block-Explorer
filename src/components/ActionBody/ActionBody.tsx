import React from 'react';
import styled from 'styled-components';
import JSONPretty from 'react-json-pretty';

import { TransactionAction } from '../../types';

const Wrapper = styled.div`
  margin: 8px 0;
`;

const ActionIndex = styled.span``;

export default function({ action }: { action: TransactionAction }) {
  const data: any = { ...action, index: undefined, accounts: undefined, events: undefined };

  if (action.events && action.events.length) {
    data.events = action.events;
  }

  return (
    <Wrapper key={action.index}>
      <ActionIndex>Action ({action.index}):</ActionIndex>
      <JSONPretty json={data} />
    </Wrapper>
  );
}
