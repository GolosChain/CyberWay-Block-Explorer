import React, { PureComponent } from 'react';
import styled from 'styled-components';

const Wrapper = styled.footer`
  flex-shrink: 0;
  padding: 8px 16px;
  background-color: #eee;
`;

export default class Footer extends PureComponent<any> {
  render() {
    return <Wrapper>FOOTER</Wrapper>;
  }
}
