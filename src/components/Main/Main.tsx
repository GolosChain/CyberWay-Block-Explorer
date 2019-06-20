import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Route } from 'react-router-dom';

import BlockFeed from '../../pages/BlockFeed';
import Block from '../../pages/Block';
import Transaction from '../../pages/Transaction';

const Wrapper = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
`;

type Props = {
  loadBlockChainInfo: Function;
};

export default class Main extends PureComponent<Props> {
  componentDidMount() {
    const { loadBlockChainInfo } = this.props;
    loadBlockChainInfo();
  }

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
