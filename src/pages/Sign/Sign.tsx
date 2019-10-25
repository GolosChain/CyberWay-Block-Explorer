import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { ErrorLine } from '../../components/Form';
import Signer from '../../components/Signer';

const Wrapper = styled.div`
  margin: 16px 16px 200px;
`;

const Title = styled.h1`
  margin: 12px 0;
`;

export default class Sign extends PureComponent {
  useQuery() {
    return new URLSearchParams(window.location.search);
  }

  render() {
    const param = this.useQuery().get('trx') || '';
    let trx: object | null = null;
    try {
      trx = JSON.parse(param);
    } catch (e) {
      console.error(`Failed to parse transaction: ${e.message}`);
    }

    return (
      <Wrapper>
        <Title>Sign transaction</Title>
        {param && !trx ? <ErrorLine>Can't parse trx</ErrorLine> : null}
        <Signer trx={trx} />
      </Wrapper>
    );
  }
}
