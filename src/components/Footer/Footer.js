import React, { PureComponent } from 'react';
import styled from 'styled-components';

const Wrapper = styled.footer`
  flex-shrink: 0;
`;

export default class Footer extends PureComponent {
  render() {
    return <Wrapper>FOOTER</Wrapper>;
  }
}
