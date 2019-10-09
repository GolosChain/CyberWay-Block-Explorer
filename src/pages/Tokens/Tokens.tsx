import React, { PureComponent } from 'react';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';
import { LoadTokensParams } from './Tokens.connect';
import { TokenStatType } from '../../types';
import { Field, FieldTitle, FieldValue } from '../../components/Form';
import AccountName from '../../components/AccountName';

const Wrapper = styled.div`
  margin: 16px;
`;

const Title = styled.h1`
  margin: 12px 0;
`;

const TokenItem = styled.div``;

const TokenTitle = styled.h2`
  font-size: 20px;
  border-top: 1px solid #ddd;
  margin-top: 32px;
  padding-top: 12px;
`;

const TokenSubtitle = styled.span`
  font-size: 16px;
  color: #666;
`;

const AccountNameStyled = styled(AccountName)`
  color: #000;
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

      this.setState({
        tokens: items,
      });
    } catch (err) {
      ToastsManager.error(`Tokens loading failed: ${err.message}`);
    }
  }

  renderToken(token: TokenStatType) {
    const { symbol, supply, maxSupply, issuer, nulls, funds } = token;
    const supplyValue = supply.split(' ')[0];
    const precision = (supplyValue.split('.')[1] || '').length;
    const circulating =
      parseFloat(supplyValue) - parseFloat(funds.split(' ')[0]) - parseFloat(nulls.split(' ')[0]);
    // const percent = (parseFloat(supply.split(' ')[0]) / parseFloat(maxSupply.split(' ')[0])) * 100;

    return (
      <TokenItem key={symbol}>
        <TokenTitle>
          {symbol}{' '}
          <TokenSubtitle>
            issued by <AccountNameStyled account={{ id: issuer }} addLink />
          </TokenSubtitle>
        </TokenTitle>
        <Field line>
          <FieldTitle>Circulating supply: </FieldTitle>
          <FieldValue>
            {circulating.toFixed(precision)} {symbol}
          </FieldValue>
        </Field>
        <Field line>
          <FieldTitle>Supply: </FieldTitle>
          <FieldValue>
            {supply}
            {/* ({percent.toFixed(2)}% of max) */}
          </FieldValue>
        </Field>
        <Field line>
          <FieldTitle>Burned: </FieldTitle>
          <FieldValue>
            {nulls} <small>(included in Supply)</small>
          </FieldValue>
        </Field>
        <Field line>
          <FieldTitle>Max supply: </FieldTitle>
          <FieldValue>{maxSupply}</FieldValue>
        </Field>
        <Field line>
          <FieldTitle>Precision: </FieldTitle>
          <FieldValue>{precision} decimals</FieldValue>
        </Field>
      </TokenItem>
    );
  }

  render() {
    const { tokens } = this.state;

    return (
      <Wrapper>
        <Title>Tokens</Title>
        {tokens ? (tokens as any).map(this.renderToken) : 'Loading ...'}
      </Wrapper>
    );
  }
}
