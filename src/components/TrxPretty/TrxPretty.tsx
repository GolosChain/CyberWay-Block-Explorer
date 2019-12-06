import React, { PureComponent } from 'react';
import styled from 'styled-components';
import JSONPretty from 'react-json-pretty';
import { ActionType } from '../../types';
import { ErrorLine } from '../Form';

const CLR_AUTH = '#d56';
const CLR_ACT_NAME = '#55f';

const Wrapper = styled.div``;

const Tabs = styled.div`
  margin-bottom: 16px;
  background: #f8f8f8;
`;

const TabHead = styled.label`
  display: inline-block;
  padding: 4px 8px;
  margin: 8px 8px 0 0;
  background: #f0f0f0;
  border-radius: 4px 4px 0 0;
`;

const TabBody = styled.div`
  padding: 16px 0;
`;

const Trx = styled.div`
  word-break: break-all;
  background: #eee;
  font-size: 12px;
  font-family: monospace;
`;

const JSONPrettyStyled = styled(JSONPretty)`
  font-size: 12px;
`;

const Auth = styled.code`
  font-size: 90%;
  color: ${CLR_AUTH};
`;

// TODO: link from action name to docs
const ActionName = styled.code`
  color: ${CLR_ACT_NAME};
`;

const Actions = styled.ol`
  margin-left: 24px;
  font-size: 13px;
`;

const Action = styled.li`
  list-style: decimal;
  margin: 8px 0;
`;

type UnsignedTransaction = {
  actions: ActionType[];
};

function stringifyObj(obj: any, maxLength = 40) {
  if (typeof obj === 'string') {
    return `"${obj.length < maxLength ? obj : obj.substr(0, maxLength) + '…'}"`;
  } else if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return JSON.stringify(obj);
  }
  const props: string = Object.keys(obj)
    .map(k => `${k.match(/^[_a-zA-Z0-9]+$/) ? k : `"${k}"`}:${stringifyObj(obj[k])}`)
    .join(', ');
  return `{${props}}`; // adds {} around props
}

type Props = {
  trx: any | null;
  packedTrx?: string;
  showAuths?: boolean;
  onParse?: Function;
};

type TabType = 'full' | 'summ' | 'raw';

export type State = {
  actions: string[][];
  auths: string[];
  valid: boolean;
  tab: TabType;
  signing: boolean;
  trxId: string;
  trxDetails: any;
};

export default class TrxPretty extends PureComponent<Props, State> {
  state = {
    actions: [] as string[][],
    auths: [] as string[],
    valid: false,
    tab: 'full' as TabType,
    signing: false,
    trxId: '',
    trxDetails: null,
  };

  componentDidMount() {
    if (this.props.trx) {
      this.parseTrx();
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {trx} = this.props;
    if (trx && trx !== prevProps.trx) {
      this.parseTrx();
    }
  }

  parseTrx() {
    const { trx, onParse } = this.props;
    const { actions } = trx;
    const funcs: string[][] = [];
    let auths: string[] = [];
    let valid = true;

    if (!actions) {
      return; // don't call onParse on malformed transaction
    }

    for (const action of actions) {
      const { account, name, authorization, data } = action;
      const actionAuths: string[] = [];
      const good = account != null && name != null && data != null && Array.isArray(authorization);

      if (good) {
        for (const { actor, permission } of authorization) {
          if (actor != null && permission != null) {
            actionAuths.push(`${actor}@${permission}`);
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

    valid = valid && funcs.length > 0;
    auths = auths.filter((auth, idx, self) => self.indexOf(auth) === idx);
    this.setState({ actions: funcs, auths, valid }, () => {
      if (valid && onParse) {
        onParse(this.state);
      }
    });
  }

  onChangeTab(e: any) {
    this.setState({ tab: e.target.value });
  }

  renderAuths() {
    const { auths } = this.state;
    return (
      <>
        <h4>Required auths:</h4>
        {auths.map((auth, i) => (
          <span key={i}>
            {i === 0 ? '' : ', '}
            <Auth>{auth}</Auth>
          </span>
        ))}
      </>
    );
  }

  tabTitle(tab: TabType) {
    return {
      full: 'Full transaction',
      summ: 'Actions summary',
      raw: 'Raw transaction',
    }[tab];
  }

  render() {
    const { trx, packedTrx, showAuths } = this.props;
    const { actions, valid, tab } = this.state;

    return (
      <Wrapper>
        {trx ? (
          <>
            <Tabs onChange={this.onChangeTab.bind(this)}>
              <TabHead>
                <input type="radio" name="trx-tab" value="full" checked={tab === 'full'} /> Full
                transaction
              </TabHead>
              <TabHead>
                <input type="radio" name="trx-tab" value="summ" checked={tab === 'summ'} /> Actions
                summary
              </TabHead>
              {packedTrx ? (
                <TabHead>
                  <input type="radio" name="trx-tab" value="raw" checked={tab === 'raw'} /> Raw
                  transaction
                </TabHead>
              ) : null}
              <TabBody>
                <h4>{this.tabTitle(tab)}:</h4>
                {tab === 'full' ? (
                  <JSONPrettyStyled json={trx} />
                ) : tab === 'raw' ? (
                  <Trx>{packedTrx}</Trx>
                ) : (
                  <>
                    <Actions>
                      {actions.map(([action, params, auth], i) => (
                        <Action key={i}>
                          <code>
                            <ActionName>{action}</ActionName>({params})
                          </code>{' '}
                          🔑&nbsp;<Auth>{auth}</Auth>
                        </Action>
                      ))}
                    </Actions>
                    {!showAuths ? this.renderAuths() : null}
                  </>
                )}
              </TabBody>
            </Tabs>
            {valid ? null : <ErrorLine>Error: invalid transaction structure</ErrorLine>}
            {showAuths ? this.renderAuths() : null}
          </>
        ) : (
          <p>No transaction provided</p>
        )}
      </Wrapper>
    );
  }
}
