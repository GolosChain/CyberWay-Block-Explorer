import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Route } from 'react-router-dom';

import BlockFeed from '../BlockFeed';
import Block from '../Block';
import Transaction from '../Transaction';

const Wrapper = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
`;

export default class Main extends PureComponent {
  render() {
    return (
      <Wrapper>
        <Route path="/" exact component={BlockFeed} />
        <Route path="/block/:blockId" exact component={Block} />
        <Route path="/trx/:transactionId" exact component={Transaction} />
        <></>
      </Wrapper>
    );
  }
}
