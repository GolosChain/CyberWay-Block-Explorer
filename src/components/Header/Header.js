import React, { PureComponent } from 'react';
import styled from 'styled-components';

const Wrapper = styled.header`
  flex-shrink: 0;
`;

export default class Header extends PureComponent {
  render() {
    return <Wrapper>HEADER</Wrapper>;
  }
}
