import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { isNot } from 'styled-is';
import { PermissionType, BasePermissionLink } from '../../types';
import Authority from '../Authority';
import AccountName from '../AccountName';

const Wrapper = styled.div``;

const Permission = styled.div`
  margin: 4px 0 4px 16px;
  font-size: 12px;
  max-width: 880px;
`;

const Base = styled.div<{ root?: boolean }>`
  background: #eef;
  border: 1px solid #dde;
  border-radius: 4px;
  padding: 6px;
  position: relative;
  display: flex;

  &:hover {
    background: #f4f4ff;
  }

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

const AuthLinks = styled.ul`
  align-self: flex-start;
  margin: -6px -6px 0 auto;
  padding: 6px;
  border: 3px solid #fff;
  border-width: 0 0 3px 3px;
  border-radius: 0 0 0 6px;
  background: linear-gradient(90deg, rgba(0, 0, 128, 0.05), transparent);
`;

type Props = {
  perm: PermissionType;
  links?: BasePermissionLink[];
};

export default class AccountPermission extends PureComponent<Props> {
  getPermissionLinks(name: string) {
    const links = this.props.links || [];
    return links.filter(({ permission }) => permission === name);
  }

  renderPerm({ name, auth, children }: PermissionType, root?: boolean) {
    const links = this.getPermissionLinks(name);

    return (
      <Permission key={name}>
        <Base root={root}>
          <Name>{name}</Name>
          <Authority auth={auth} />
          {links.length ? (
            <AuthLinks>
              {links.map(({ code, action }, i) => {
                const title = `allows to execute ${action || 'ANY'} action of ${code} contract`;
                return (
                  <li key={i} title={title}>
                    <AccountName account={{ id: code }} addLink />
                    ::{action || '*'}
                  </li>
                );
              })}
            </AuthLinks>
          ) : null}
        </Base>
        {children && children.length ? children.map(x => this.renderPerm(x)) : null}
      </Permission>
    );
  }

  render() {
    return <Wrapper>{this.renderPerm(this.props.perm, true)}</Wrapper>;
  }
}
