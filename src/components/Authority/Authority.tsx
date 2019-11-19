import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { AuthorityType } from '../../types';
import AccountName from '../AccountName';

const Wrapper = styled.div`
  display: flex;
  margin-left: 4px;
`;

const Threshold = styled.span`
  font-weight: bold;
  font-size: 12px;
  height: 18px;
  width: 18px;
  line-height: 18px;
  border-radius: 12px;
  background: #cec;
  display: inline-block;
  text-align: center;
`;

const Items = styled.ul`
  background: linear-gradient(90deg, rgba(0, 0, 128, 0.08), transparent);
  margin: -6px 8px;
  padding: 6px;
`;

const Item = styled.li`
  margin-bottom: 6px;
`;

type Props = {
  auth: AuthorityType;
};

export default class Authority extends PureComponent<Props> {
  render() {
    const { threshold, keys, accounts, waits } = this.props.auth;

    return (
      <Wrapper>
        <div>
          <Threshold title="weight threshold">{threshold}</Threshold>
        </div>
        <Items>
          {keys.map(({ weight, key }) => (
            <Item key={key}>
              +{weight} 🔑{key}
            </Item>
          ))}
          {accounts.map(({ weight, permission: p }) => (
            <Item key={JSON.stringify(p)}>
              +{weight} 👤
              <AccountName account={{ id: p.actor }} addLink /> @{p.permission}
            </Item>
          ))}
          {waits.map(({ weight, waitSec }, i) => (
            <Item key={i}>
              +{weight} ⏳{waitSec} seconds
            </Item>
          ))}
          {keys.length + accounts.length + waits.length ? null : '⚠️empty'}
        </Items>
      </Wrapper>
    );
  }
}
