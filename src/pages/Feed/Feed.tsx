import React, { PureComponent } from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';

import BlockFeed from '../../components/BlockFeed';

const Wrapper = styled.div`
  margin: 16px;
`;

export default class Feed extends PureComponent {
  render() {
    return (
      <Wrapper>
        <Helmet title="Block feed" />
        <BlockFeed />
      </Wrapper>
    );
  }
}
