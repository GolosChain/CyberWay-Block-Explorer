import React, { PureComponent } from 'react';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';
import { LoadTokensParams } from './Tokens.connect';
import { TokenStatType } from '../../types';
import TokenCard from '../../components/TokenCard';

const Wrapper = styled.div`
  margin: 16px;
`;

const Title = styled.h1`
  margin: 12px 0;
`;

export type Props = {
  loadTokens: (params: LoadTokensParams) => any;
};

export type State = {
  tokens: TokenStatType[] | null;
};

export default class Tokens extends PureComponent<Props, State> {
  state = {
    tokens: null,
  };

  componentDidMount() {
    this.loadTokens();
  }

  async loadTokens() {
    const { loadTokens } = this.props;

    try {
      const { items } = await loadTokens({});

      this.setState({ tokens: items });
    } catch (err) {
      ToastsManager.error(`Tokens loading failed: ${err.message}`);
    }
  }

  render() {
    const { tokens } = this.state;

    return (
      <Wrapper>
        <Title>Tokens</Title>
        {tokens
          ? (tokens as any).map((token: TokenStatType) => (
              <TokenCard key={token.symbol} token={token} addLink />
            ))
          : 'Loading ...'}
      </Wrapper>
    );
  }
}
