import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import SearchPanel from '../SearchPanel';

const Wrapper = styled.header`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 8px 16px;
  background-color: #eee;
`;

const Info = styled.div`
  margin-left: 40px;
`;

export default class Header extends PureComponent {
  render() {
    const { blockchainHost } = this.props;

    return (
      <Wrapper>
        <Link to="/">Home</Link>
        <SearchPanel />
        <Info>Blockchain: {blockchainHost || 'N/A'}</Info>
      </Wrapper>
    );
  }
}
