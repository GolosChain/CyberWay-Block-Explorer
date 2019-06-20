import React, { PureComponent } from 'react';
import styled from 'styled-components';

import Routes from '../../routes';

const Wrapper = styled.main`
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
        <Routes />
      </Wrapper>
    );
  }
}
