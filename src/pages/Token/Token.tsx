import React, { PureComponent } from 'react';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';
import { LoadTokenParams } from './Token.connect';
import { TokenStatType } from '../../types';
import TokenCard from '../../components/TokenCard';
import TokenHolders from '../../components/TokenHolders';

const Wrapper = styled.div`
  margin: 16px;
`;

const Title = styled.h1`
  margin: 12px 0;
`;

export type Props = {
  symbol: string;
  loadTokens: (params: LoadTokenParams) => any;
};

export type State = {
  token: TokenStatType | null;
  notFound: Boolean;
};

export default class Token extends PureComponent<Props, State> {
  state = {
    token: null,
    notFound: false,
  };

  componentDidMount() {
    this.load();
  }

  async load() {
    const { symbol, loadTokens } = this.props;

    try {
      const { items } = await loadTokens({});
      const token = items.find((item: TokenStatType) => item.symbol === symbol);

      this.setState({ token, notFound: !token });
    } catch (err) {
      ToastsManager.error(`Tokens loading failed: ${err.message}`);
    }
  }

  render() {
    const { token, notFound } = this.state;
    const { symbol } = this.props;

    return (
      <Wrapper>
        {token ? (
          <>
            <Title>{symbol} token details</Title>
            <TokenCard token={token as any} />
            <br />
            <TokenHolders symbol={symbol} supply={parseFloat((token as any).supply)} />
          </>
        ) : notFound ? (
          'Token not found'
        ) : (
          'Loading ...'
        )}
      </Wrapper>
    );
  }
}
