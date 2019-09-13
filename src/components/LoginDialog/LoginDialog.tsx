import React, { PureComponent, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import Modal from 'react-responsive-modal';

import { AccountType, AuthType } from '../../types';
import { getKey } from '../../utils/password';
import { Field, FieldTitle } from '../Form';

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

const Button = styled.button<{ primary?: boolean }>`
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
`;

type Props = {
  account?: AccountType | null;
  lockAccountId?: boolean;
  onLogin: (auth: AuthType) => void;
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

  onSubmit = (e: FormEvent) => {
    e.preventDefault();

    const { account, onLogin } = this.props;
    const { accountId, password } = this.state;

    let passAccountInfo = null;

    if (account && account.id === accountId) {
      passAccountInfo = account;
    }

    const normalizedAccountId = accountId
      .trim()
      .toLowerCase()
      .replace(/@.*$/, '');

    onLogin({
      accountId: normalizedAccountId,
      key: getKey({
        accountId: normalizedAccountId,
        account: passAccountInfo,
        userInput: password.trim(),
      }),
    });
  };

  render() {
    const { lockAccountId, onClose } = this.props;
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
            <Button primary>Authorize</Button>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
          </Buttons>
        </Form>
      </Modal>
    );
  }
}
