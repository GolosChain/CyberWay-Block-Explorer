import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.span`
  font-size: 14px;
  font-weight: normal;
`;

const Option = styled.span`
  margin: 0 2px;

  ${({ isActive }) =>
    isActive
      ? 'font-weight: 600; cursor: default;'
      : 'color: #00f; text-decoration: underline; cursor: pointer;'}
`;

export default function InlineSwitch({ value, options, onChange }) {
  const children = [];

  for (const option of options) {
    children.push(
      <Option key={option} isActive={value === option} onClick={() => onChange(option)}>
        {option}
      </Option>,
      '|'
    );
  }

  // Удаляем последний сепаратор
  children.pop();

  return <Wrapper>({children})</Wrapper>;
}
