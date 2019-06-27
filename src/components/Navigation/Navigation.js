import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Wrapper = styled.nav``;

const List = styled.ul`
  display: flex;
`;

const Item = styled.li`
  margin-right: 8px;

  &:not(:last-child)::after {
    display: inline-block;
    margin-left: 8px;
    content: '/';
  }
`;

export default class Navigation extends PureComponent {
  render() {
    const { items } = this.props;

    return (
      <Wrapper>
        <List>
          {items.map(({ url, text }, i) => (
            <Item key={i}>{url ? <Link to={url}>{text}</Link> : text}</Item>
          ))}
        </List>
      </Wrapper>
    );
  }
}
