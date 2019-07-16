import React from 'react';
import styled from 'styled-components';
import is from 'styled-is';

import Link from '../Link';

const Wrapper = styled.span`
  font-size: 14px;
  font-weight: normal;
`;

const StyledLink = styled(Link)`
  margin: 0 2px;
  color: #00f;
  text-decoration: underline;
  cursor: pointer;

  &.is-active {
    font-weight: 600;
    text-decoration: none;
    color: #000;
    cursor: default;
  }

  ${is('isActive')`
    
  `};
`;

type Props = {
  options: {
    to: string;
    label: string;
  }[];
};

export default function InlineSwitch({ options }: Props) {
  const children = [];

  for (const { to, label } of options) {
    children.push(
      <StyledLink key={label} to={to} activeClassName="is-active" exact keepHash>
        {label}
      </StyledLink>,
      '|'
    );
  }

  // Удаляем последний сепаратор
  children.pop();

  return <Wrapper>({children})</Wrapper>;
}
