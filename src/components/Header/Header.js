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

export default class Header extends PureComponent {
  render() {
    return (
      <Wrapper>
        <Link to="/">HEADER</Link>
        <SearchPanel />
      </Wrapper>
    );
  }
}
