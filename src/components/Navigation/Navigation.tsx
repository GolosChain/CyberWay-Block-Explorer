import React, { PureComponent } from 'react';
import styled from 'styled-components';
import Link from '../Link';

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

type Props = {
  items: {
    text: string;
    url?: string | null;
  }[];
};

export default class Navigation extends PureComponent<Props> {
  render() {
    const { items } = this.props;

    return (
      <Wrapper>
        <List>
          {items.map(({ text, url }, i) => (
            <Item key={i}>
              {url ? (
                <Link to={url} keepHash>
                  {text}
                </Link>
              ) : (
                text
              )}
            </Item>
          ))}
        </List>
      </Wrapper>
    );
  }
}
