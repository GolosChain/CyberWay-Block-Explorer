import React, { PureComponent, FormEvent } from 'react';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';
import JSONPretty from 'react-json-pretty';

import { ActionType } from '../../types';
import { ErrorLine } from '../Form';
import Link from '../Link';
import { pushTransactionUsingKeys } from '../../utils/cyberway';

const CLR_AUTH = '#d56';
const CLR_ACT_NAME = '#55f';

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

const Tabs = styled.div`
  margin-bottom: 16px;
  // border: 1px solid #aaa;
  background: #f8f8f8;
`;

const TabHead = styled.label`
  display: inline-block;
  padding: 4px 8px;
  margin: 8px 8px 0 0;
  // border: 1px solid #999;
  // border-bottom-width: 0;
  background: #f0f0f0;
  border-radius: 4px 4px 0 0;
`;

const TabBody = styled.div`
  padding: 16px 0;
  // border: 1px solid #999;
  // border-top-width: 0;
`;

const Auth = styled.code`
  font-size: 14px;
  color: ${CLR_AUTH};
`;

// TODO: link from action name to docs
const ActionName = styled.code`
  color: ${CLR_ACT_NAME};
`;

const Actions = styled.ol`
  margin-left: 24px;
`;

const Action = styled.li`
  list-style: decimal;
  margin: 8px 0;
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

function stringifyObj(obj: any, maxLength = 40) {
  if (typeof obj === 'string') {
    return `"${obj.length < maxLength ? obj : obj.substr(0, maxLength) + '…'}"`;
  } else if (typeof obj !== 'object' || Array.isArray(obj)) {
    return JSON.stringify(obj);
  }
  let props: string = Object.keys(obj)
    .map(k => `${k.match(/^[_a-zA-Z0-9]+$/) ? k : `"${k}"`}:${stringifyObj(obj[k])}`)
    .join(', ');
  return `{${props}}`;
}

export type Props = {
  trx: any | null;
};

export type State = {
  actions: string[];
  auths: string[];
  valid: boolean;
  tab: 'full' | 'summ';
  keys: string[];
  signing: boolean;
  trxId: string;
  trxDetails: any;
};

export default class Signer extends PureComponent<Props> {
  state = {
    actions: [],
    auths: [],
    valid: false,
    tab: 'full',
    keys: [],
    signing: false,
    trxId: '',
  };

  componentDidMount() {
    const trx: UnsignedTransaction = this.props.trx;
    if (!trx) {
      return;
    }
    const { actions } = trx;
    const funcs: string[][] = [];
    const auths: string[] = [];
    const keys: string[] = [];
    let valid = true;

    for (const action of actions) {
      const { account, name, authorization, data } = action;
      const actionAuths: string[] = [];
      const good = account != null && name != null && data != null && Array.isArray(authorization);

      if (good) {
        for (const {actor, permission} of authorization) {
          if (actor != null && permission != null) {
            actionAuths.push(`${actor}@${permission}`);
            keys.push('');
          } else {
            valid = false;
          }
        }
        funcs.push([`${account}::${name}`, stringifyObj(data), actionAuths.join(', ')]);
        auths.push(...actionAuths);
      } else {
        funcs.push(['? wrong format', '']);
        valid = false;
      }
    }

    this.setState({
      actions: funcs,
      auths: auths.filter((auth, idx, self) => self.indexOf(auth) === idx),
      valid: valid && funcs.length > 0,
      keys,
    });
  }

  onChangeTab(e: any) {
    this.setState({ tab: e.target.value });
  }

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
    } catch (e) {
      ToastsManager.error(`Failed to push: ${e.message}`);
      this.setState({ signing: false });
    }
  };

  render() {
    const { trx } = this.props;
    const { actions, auths, valid, tab, keys, signing, trxId } = this.state;
    const cantSign = !valid || signing || trxId !== '';

    return (
      <Wrapper>
        {trx ? (
          <>
            <Warning>
              <span>{'⚠️'}</span> <b>Warning!</b> Please review transaction before signing.
            </Warning>
            <h3>Transaction:</h3>
            <Tabs onChange={this.onChangeTab.bind(this)}>
              <TabHead>
                <input type="radio" name="trx-tab" value="full" checked={tab === 'full'} /> Full
                transaction
              </TabHead>
              <TabHead>
                <input type="radio" name="trx-tab" value="summ" checked={tab === 'summ'} /> Actions
                summary
              </TabHead>
              {tab === 'full' ? (
                <TabBody>
                  <h4>Full transaction:</h4>
                  <JSONPretty json={trx} />
                </TabBody>
              ) : (
                <TabBody>
                  <h4>Actions summary:</h4>
                  <Actions>
                    {actions.map(([action, params, auth], i) => (
                      <Action key={`action-${i}`}>
                        <code>
                          <ActionName>{action}</ActionName>({params})
                        </code>{' '}
                        🔑&nbsp;<Auth>{auth}</Auth>
                      </Action>
                    ))}
                  </Actions>
                </TabBody>
              )}
            </Tabs>
            {valid ? null : <ErrorLine>Error: invalid transaction structure</ErrorLine>}
            <h3>Required auths:</h3>
            {auths.map((auth, i) => (
              <>
                {i === 0 ? '' : ', '}
                <Auth>{auth}</Auth>
              </>
            ))}
            <form onSubmit={this.onSubmit}>
              {keys.map((key, i) => (
                <Input
                  key={`key${i}`}
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
