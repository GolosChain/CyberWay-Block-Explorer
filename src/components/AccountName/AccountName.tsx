import React, { PureComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';

import Link from '../../components/Link';
import { AccountType } from '../../types';

const Wrapper = styled.div<{ twoLines?: boolean }>`
  display: inline-block;

  ${is('twoLines')`
    display: flex;
    flex-direction: column;
  `};
`;

const Account = styled.span``;

const Username = styled.span<{ twoLines?: boolean }>`
  margin: 0 0 0 6px;
  font-size: 13px;
  color: #888;

  ${is('twoLines')`
    margin: 1px 0 0;
  `};
`;

type Props = {
  account: AccountType;
  className?: string;
  twoLines?: boolean;
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
      <Wrapper className={className} twoLines={twoLines}>
        {addLink ? (
          <Account>
            <Link to={`/account/${account.id}`}>{account.id}</Link>
          </Account>
        ) : (
          <Account>{account.id}</Account>
        )}
        {username ? <Username twoLines={twoLines}>{username}@golos</Username> : null}
      </Wrapper>
    );
  }
}
