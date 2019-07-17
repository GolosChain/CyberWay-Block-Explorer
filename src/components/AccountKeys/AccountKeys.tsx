import React, { PureComponent } from 'react';
import styled from 'styled-components';
import JSONPretty from 'react-json-pretty';

import { KeyInfo } from '../../types';

const Wrapper = styled.div``;

const KeyLine = styled.div`
  margin: 4px 0;
`;

const ComplexKey = styled.div`
  margin-bottom: 8px;
`;

const Public = styled.span`
  color: #777;
`;

type Props = {
  keys: any;
};

export default class AccountKeys extends PureComponent<Props> {
  renderKey(keyData: KeyInfo) {
    if (
      keyData.threshold === 1 &&
      keyData.keys.length === 1 &&
      keyData.accounts.length === 0 &&
      keyData.waits.length === 0
    ) {
      return (
        <>
          {keyData.keys[0].key} <Public>(public key)</Public>
        </>
      );
    }

    return (
      <ComplexKey>
        [Complex Key]:
        <JSONPretty json={keyData} />
      </ComplexKey>
    );
  }

  render() {
    const { keys } = this.props;

    const keysLines = [];

    const keyTypes = Object.keys(keys);

    if (keyTypes.length === 0) {
      return `Keys can't be loaded`;
    }

    for (const keyName of keyTypes) {
      keysLines.push(
        <KeyLine>
          {keyName}: {this.renderKey(keys[keyName])}
        </KeyLine>
      );
    }

    return <Wrapper>{keysLines}</Wrapper>;
  }
}
