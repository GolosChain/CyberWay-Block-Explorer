import React, { PureComponent } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  padding: 16px;
  border-radius: 8px;
  background: #f6f6f6;
`;

const Title = styled.div`
  font-size: 18px;
  margin-bottom: 5px;
  font-weight: 500;
`;

const Line = styled.div`
  margin: 6px 0;
`;

const Label = styled.span``;

const Value = styled.span``;

type Props = {};

export default class BlockChainStatus extends PureComponent<Props> {
  render() {
    return (
      <Wrapper>
        <Title>Blockchain status:</Title>
        <Line>
          <Label>Last block #:</Label> <Value>111</Value>
        </Line>
        <Line>
          <Label>Last irreversible block #:</Label> <Value>99</Value>
        </Line>
        <Line>
          <Label>Total transactions:</Label> <Value>1030</Value>
        </Line>
      </Wrapper>
    );
  }
}
