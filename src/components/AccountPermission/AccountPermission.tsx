import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { isNot } from 'styled-is';
import { PermissionType } from '../../types';
import Authority from '../Authority';

const Wrapper = styled.div``;

const Permission = styled.div`
  margin: 4px 0 4px 16px;
  font-size: 12px;
`;

const Base = styled.div<{ root?: boolean }>`
  background: #eef;
  border: 1px solid #dde;
  border-radius: 4px;
  padding: 6px;
  position: relative;
  display: flex;

  ${isNot('root')`
    &::before {
      content: '';
      position: absolute;
      display: inline-block;
      left: -8px;
      top: -6px;
      width: 7px;
      height: 18px;
      border: 1px solid #777;
      border-width: 0 0 1px 1px;
    }
  `};
`;

const Name = styled.span`
  font-weight: bold;
  font-size: 14px;
`;

type Props = {
  perm: PermissionType;
};

export default class AccountPermission extends PureComponent<Props> {
  renderPerm({ name, auth, children }: PermissionType, root?: boolean) {
    return (
      <Permission key={name}>
        <Base root={root}>
          <Name>{name}</Name>
          <Authority auth={auth} />
        </Base>
        {children && children.length ? children.map(x => this.renderPerm(x)) : null}
      </Permission>
    );
  }

  render() {
    return <Wrapper>{this.renderPerm(this.props.perm, true)}</Wrapper>;
  }
}
