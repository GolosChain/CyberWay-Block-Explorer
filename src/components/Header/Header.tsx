import React, { PureComponent } from 'react';
import styled from 'styled-components';

import Link from '../Link';
import SearchPanel from '../SearchPanel';

const Wrapper = styled.header`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 8px 16px;
  background-color: #eee;
`;

const Nav = styled.nav``;
const Ul = styled.ul`
  display: flex;
`;
const Li = styled.li`
  margin-right: 8px;
`;

const Info = styled.div`
  margin-left: 40px;
`;

type Props = {
  blockchainHost: string | null;
};

export default class Header extends PureComponent<Props> {
  render() {
    const { blockchainHost } = this.props;

    return (
      <Wrapper>
        <Nav>
          <Ul>
            <Li>
              <Link to="/">Home</Link>
            </Li>
            <Li>
              <Link to="/validators">Validators</Link>
            </Li>
          </Ul>
        </Nav>
        <SearchPanel />
        <Info>Blockchain: {blockchainHost || 'N/A'}</Info>
      </Wrapper>
    );
  }
}
