import React, { PureComponent } from 'react';
import styled from 'styled-components';
import BlockFeed from '../../components/BlockFeed';
import BlockChainStatus from '../../components/BlockChainStatus';

const Wrapper = styled.div`
  margin: 16px;
`;

export default class Home extends PureComponent {
  render() {
    return (
      <Wrapper>
        <BlockChainStatus />
        <BlockFeed />
      </Wrapper>
    );
  }
}
