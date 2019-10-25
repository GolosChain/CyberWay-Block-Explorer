import React, { PureComponent, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import Modal from 'react-responsive-modal';

import { AccountType, KeyAuthType } from '../../types';
import { getKey } from '../../utils/password';
import { getAccountPublicKey } from '../../utils/cyberway';
import { Field, FieldTitle } from '../Form';
import Link from '../Link';

const Form = styled.form``;

const DialogTitle = styled.h1`
  margin-bottom: 24px;
  font-size: 30px;
`;

const Fields = styled.div`
  padding: 30px 40px 10px;
`;

const FieldStyled = styled(Field)`
  margin: 16px 0;
`;

const FieldTitleStyled = styled(FieldTitle)`
  margin-bottom: 8px;
`;

const Input = styled.input<{ autocomplete?: string }>`
  appearance: none;
  padding: 6px 10px;
  border: 1px solid #777;
  border-radius: 4px;
  color: #333;
  background: #fff;

  &:disabled {
    color: #000;
    background: #ececec;
  }
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0 40px 12px;
`;

const Button = styled.button<{ primary?: boolean; link?: boolean }>`
  appearance: none;
  padding: 6px 10px;
  border: 1px solid #777;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;

  &:not(:last-child) {
    margin-right: 10px;
  }

  ${is('primary')`
    color: #fff;
    background: #4277f2;
  `};

  ${is('link')`
    border-color: transparent;
  `};
`;

const Span = styled.span`
  padding: 7px 0;
`;

type Props = {
  account?: AccountType | null;
  signLink?: string | null;
  lockAccountId?: boolean;
  onLogin: (auth: KeyAuthType) => void;
  onClose: () => void;
};

export default class LoginDialog extends PureComponent<Props> {
  state = {
    accountId: this.props.account ? this.props.account.id : '',
    password: '',
  };

  onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      password: e.target.value,
    });
  };

  onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { account, onLogin } = this.props;
    const { accountId, password } = this.state;

    let golosId = null;

    if (account && account.id === accountId) {
      golosId = account.golosId;
    }

    const normalizedAccountId = accountId
      .trim()
      .toLowerCase()
      .replace(/@.*$/, '');

    const key = await getAccountPublicKey(normalizedAccountId, 'active');

    onLogin({
      accountId: normalizedAccountId,
      key: getKey({
        accountId: normalizedAccountId,
        golosId,
        publicKey: key,
        userInput: password.trim(),
      }),
    });
  };

  render() {
    const { lockAccountId, onClose, signLink } = this.props;
    const { accountId, password } = this.state;

    return (
      <Modal open={true} center onClose={onClose}>
        <Form onSubmit={this.onSubmit}>
          <Fields>
            <DialogTitle>Action needs authorization</DialogTitle>
            <FieldStyled>
              <FieldTitleStyled>Account id:</FieldTitleStyled>
              <Input
                value={accountId}
                disabled={lockAccountId}
                required
                onChange={this.onPasswordChange}
              />
            </FieldStyled>
            <FieldStyled>
              <FieldTitleStyled>Master password or active key:</FieldTitleStyled>
              <Input
                type="password"
                value={password}
                required
                autocomplete="current-password"
                onChange={this.onPasswordChange}
              />
            </FieldStyled>
          </Fields>
          <Buttons>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button primary>Authorize</Button>
            {signLink ? (
              <Span>
                or <Link to={signLink}>Sign</Link>
              </Span>
            ) : null}
          </Buttons>
        </Form>
      </Modal>
    );
  }
}
