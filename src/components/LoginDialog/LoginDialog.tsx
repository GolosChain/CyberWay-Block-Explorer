import React, { PureComponent, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import Modal from 'react-responsive-modal';

import { AuthType } from '../../types';
import { Field, FieldTitle } from '../Form';

type Props = {
  accountId?: string;
  lockAccountId?: boolean;
  onLogin: (auth: AuthType) => void;
  onClose: () => void;
};

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

const Input = styled.input`
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

export default class LoginDialog extends PureComponent<Props> {
  state = {
    accountId: this.props.accountId || '',
    password: '',
  };

  onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      password: e.target.value,
    });
  };

  onSubmit = (e: FormEvent) => {
    e.preventDefault();

    const { onLogin } = this.props;
    const { accountId, password } = this.state;

    onLogin({ accountId, key: password });
  };

  render() {
    const { accountId, lockAccountId, onClose } = this.props;
    const { password } = this.state;

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
              <FieldTitleStyled>Master password or key (active/owner):</FieldTitleStyled>
              <Input type="password" value={password} required onChange={this.onPasswordChange} />
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
