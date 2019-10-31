import React, { PureComponent, FormEvent } from 'react';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';

import { ActionType } from '../../types';
import TrxPretty from '../TrxPretty';
import { State as TrxState } from '../TrxPretty/TrxPretty';
import Link from '../Link';
import { pushTransactionUsingKeys } from '../../utils/cyberway';

const Wrapper = styled.div``;

const Panel = styled.div`
  padding: 8px 12px;
  margin: 4px 0 8px;
  border-radius: 8px;
  background: #eee;
`;

const Warning = styled(Panel)`
  background: #ffe0bc;
`;

const Info = styled(Panel)`
  background: #e0ffbc;
`;

const Input = styled.input`
  display: block;
  width: 40%;
  min-width: 360px;
  margin: 8px 0;
`;

const Button = styled.button`
  display: block;
  appearance: none;
  padding: 6px 10px;
  border: 1px solid #777;
  border-radius: 4px;
  color: #fff;
  background: #4277f2;
  cursor: pointer;

  &:disabled {
    color: #ddd;
    background: #aaa;
    cursor: not-allowed;
  }
`;

type UnsignedTransaction = {
  actions: ActionType[];
};

type Props = {
  trx: any | null;
};

type State = {
  valid: boolean;
  keys: string[];
  signing: boolean;
  trxId: string;
  trxDetails?: any;
};

export default class Signer extends PureComponent<Props, State> {
  state = {
    valid: false,
    signing: false,
    keys: [] as string[],
    trxId: '',
  };

  onChangeKey(index: number, newKey: string) {
    const updated: string[] = [...this.state.keys];
    updated[index] = newKey; // TODO: validate key
    this.setState({ keys: updated });
  }

  onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { trx } = this.props;
    const keys = this.state.keys.filter(key => key !== '');

    this.setState({ signing: true });

    try {
      const result = await pushTransactionUsingKeys({ keys, trx });
      this.setState({
        signing: false,
        trxId: result.transaction_id,
        trxDetails: result,
        keys: keys.map(() => ''),
      });
    } catch (err) {
      ToastsManager.error(`Failed to push: ${err.message}`);
      this.setState({ signing: false });
    }
  };

  onTrxParse(data: TrxState) {
    this.setState({ valid: data.valid, keys: data.auths.map(() => '') });
  }

  render() {
    const { trx } = this.props;
    const { valid, keys, signing, trxId } = this.state;
    const cantSign = !valid || signing || trxId !== '';

    return (
      <Wrapper>
        {trx ? (
          <>
            <Warning>
              <span>{'⚠️'}</span> <b>Warning!</b> Please review transaction before signing.
            </Warning>
            <h3>Transaction:</h3>
            <TrxPretty trx={trx} showAuths onParse={(x: TrxState) => this.onTrxParse(x)} />
            <form onSubmit={this.onSubmit}>
              {keys.map((key, i) => (
                <Input
                  key={i}
                  value={key}
                  disabled={cantSign}
                  onChange={e => this.onChangeKey(i, e.target.value)}
                  type="password"
                  placeholder="Private key"
                  required={i === 0}
                />
              ))}
              <Button disabled={cantSign}>
                {signing ? '⏳' : trxId ? '✓' : null} Sign transaction
              </Button>
            </form>
            {trxId ? (
              <>
                <Info>
                  Transaction signed: <Link to={`/trx/${trxId}`}>{trxId}</Link>
                </Info>
                {/* TODO: show/hide trxDetails */}
              </>
            ) : null}
            <hr />
            {/* TODO: show/hide editor */}
            <form method="GET" style={{ display: 'none' }}>
              <textarea name="trx" cols={80} rows={20}>
                {JSON.stringify(trx, null, 2)}
              </textarea>
              <br />
              <input type="submit" value="Update transaction" />
            </form>
          </>
        ) : (
          <p>No transaction provided</p>
        )}
      </Wrapper>
    );
  }
}
