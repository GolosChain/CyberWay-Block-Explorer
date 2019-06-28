import React from 'react';
import styled from 'styled-components';
import { Link as RouteLink } from 'react-router-dom';

const LinkStyled = styled(RouteLink)`
  color: #000;
`;

type Props = {
  to: string;
  keepHash?: boolean;
} & React.ComponentProps<any>;

export default function Link({ to, keepHash, ...props }: Props) {
  let finalTo = to;

  if (!finalTo.includes('#')) {
    finalTo += window.location.hash;
  }

  return <LinkStyled {...props} to={finalTo} />;
}
