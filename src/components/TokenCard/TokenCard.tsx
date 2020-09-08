import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Field, FieldTitle, FieldValue } from '../../components/Form';
import Link from '../Link';
import AccountName from '../AccountName';
import { TokenStatType } from '../../types';

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

type Props = {
  token: TokenStatType;
  addLink?: Boolean;
  className?: string;
};

export default class TokenCard extends PureComponent<Props> {
  render() {
    const { token, addLink, className } = this.props;
    const { symbol, supply, maxSupply, issuer, nulls, funds } = token;
    const precision = (supply.split(' ')[0].split('.')[1] || '').length;
    const circulating = parseFloat(supply) - parseFloat(funds) - parseFloat(nulls);
    const link = `/token/${symbol}`;

    return (
      <TokenItem key={symbol} className={className}>
        <TokenTitle>
          {addLink ? <Link to={link}>{symbol}</Link> : symbol}{' '}
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
        {parseFloat(nulls) > 0 && (
          <Field line>
            <FieldTitle>Burned: </FieldTitle>
            <FieldValue>
              {nulls} <small>(included in Supply)</small>
            </FieldValue>
          </Field>
        )}
        <Field line>
          <FieldTitle>Max supply: </FieldTitle>
          <FieldValue>{maxSupply}</FieldValue>
        </Field>
        <Field line>
          <FieldTitle>Precision: </FieldTitle>
          <FieldValue>{precision} decimals</FieldValue>
        </Field>
        {addLink && (
          <Link to={link}>
            <b>Top {symbol} balances &gt;</b>
          </Link>
        )}
      </TokenItem>
    );
  }
}
