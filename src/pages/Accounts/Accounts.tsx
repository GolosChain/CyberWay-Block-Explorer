import React, { ChangeEvent, PureComponent } from 'react';
import throttle from 'lodash.throttle';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';

import { AccountLine } from '../../types';
import { ACCOUNTS_LIMIT, LoadAccountsParams } from './Accounts.connect';

import Link from '../../components/Link';

const Wrapper = styled.div`
  margin: 16px;
`;

const Title = styled.h1`
  margin: 12px 0;
`;

const LinkStyled = styled(Link)`
  text-decoration: none;
`;

const Filter = styled.div`
  margin: 10px 0;
`;

const List = styled.ul`
  margin-bottom: 40px;
`;

const AccountItem = styled.li`
  margin: 4px 0;
`;

export type Props = {
  items: AccountLine[];
  isLoading: boolean;
  sequenceKey: string | null;
  loadAccounts: (params: LoadAccountsParams) => any;
};

export default class Accounts extends PureComponent<Props> {
  state = {
    inputText: '',
  };

  componentDidMount() {
    const { loadAccounts } = this.props;

    loadAccounts({}).catch((err: Error) => {
      ToastsManager.error(`Accounts loading failed: ${err.message}`);
    });
  }

  search = () => {
    const { loadAccounts } = this.props;
    const { inputText } = this.state;

    loadAccounts({ prefix: inputText.trim() });
  };

  lazySearch = throttle(this.search, 300, { leading: false, trailing: true });

  onTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState(
      {
        inputText: e.target.value,
      },
      () => {
        this.lazySearch();
      }
    );
  };

  renderLine({ id, golosId }: AccountLine) {
    return (
      <AccountItem key={id}>
        <LinkStyled to={`/account/${id}`}>
          {id}
          {golosId ? ` (${golosId})` : null}
        </LinkStyled>
      </AccountItem>
    );
  }

  render() {
    const { items } = this.props;
    const { inputText } = this.state;

    return (
      <Wrapper>
        <Title>Accounts</Title>
        <Filter>
          Starts with: <input value={inputText} onChange={this.onTextChange} />
        </Filter>
        <List>
          {items.map(item => this.renderLine(item))}
          {items.length === ACCOUNTS_LIMIT ? <AccountItem>...</AccountItem> : null}
        </List>
      </Wrapper>
    );
  }
}
