import React from 'react';
import styled from 'styled-components';
import is from 'styled-is';

const Wrapper = styled.span<{ bold?: boolean }>`
  font-family: monospace;

  ${is('bold')`
    font-weight: 600;
  `};
`;

type Props = {
  bold?: boolean;
  compact?: boolean;
  children: any;
};

export default function Id({ bold, compact, children }: Props) {
  let text = children;
  let title;

  if (compact && typeof text === 'string' && text.length > 25) {
    title = children;
    text = `${text.substr(0, 10)}…${text.substr(text.length - 10)}`;
  }

  return (
    <Wrapper bold={bold} title={title}>
      {text}
    </Wrapper>
  );
}
