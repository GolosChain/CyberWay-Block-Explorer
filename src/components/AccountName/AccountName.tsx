import React, { PureComponent } from 'react';
import styled from 'styled-components';
import Link from '../../components/Link';
import { AccountType } from '../../types';

const Wrapper = styled.div``;

const Account = styled.span`
  margin-right: 6px;
`;

const Username = styled.span`
  margin-right: 4px;
  font-size: 13px;
  color: #888;
`;

type Props = {
  account: AccountType;
  className?: string;
  twoLines?: boolean; // TODO: implement this in styles instead of adding <br />
  addLink?: boolean;
};

export default class AccountName extends PureComponent<Props> {
  render() {
    const { account, addLink, twoLines, className } = this.props;

    if (!account) {
      return null;
    }

    const username = account.golosId;

    return (
      <Wrapper className={className}>
        {addLink ? (
          <Account>
            <Link to={`/account/${account.id}`}>{account.id}</Link>
          </Account>
        ) : (
          <Account>{account.id}</Account>
        )}
        {twoLines ? <br /> : null}
        {typeof username === 'string' ? <Username>{username}@golos</Username> : null}
      </Wrapper>
    );
  }
}
