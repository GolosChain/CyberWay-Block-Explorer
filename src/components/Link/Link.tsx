import React from 'react';
import styled from 'styled-components';
import { Link as RouterLink, NavLink } from 'react-router-dom';

const LinkStyled = styled(RouterLink)`
  color: #000;
`;

const NavLinkStyled = styled(NavLink)`
  color: #000;
`;

type Props = {
  to: string;
  keepHash?: boolean;
} & React.ComponentProps<any>;

type Route = {
  pathname: string;
  search: string;
};

export default function Link({ to, keepHash, activeClassName, exact, ...props }: Props) {
  let finalTo = to;

  if (keepHash && !finalTo.includes('#')) {
    finalTo += window.location.hash;
  }

  if (activeClassName) {
    return (
      <NavLinkStyled
        {...props}
        to={finalTo}
        activeClassName={activeClassName}
        exact={exact}
        isActive={(match: Route | null, route: Route) =>
          match || route.pathname + route.search === to
        }
      />
    );
  }

  return <LinkStyled {...props} to={finalTo} />;
}
