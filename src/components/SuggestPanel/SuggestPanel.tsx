import React, { PureComponent, createRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Suggest } from '../../types';

const SYMBOLS_BY_TYPE = {
  block: 'Block',
  transaction: 'Tx',
};

const Wrapper = styled.div`
  position: absolute;
  top: 32px;
  left: 0;
  width: 500px;
  padding: 3px 0;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
`;

const List = styled.ul``;

const Item = styled.li``;

const LinkStyled = styled(Link)`
  display: block;
  padding: 8px;
  color: unset;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: #fff;
    background-color: #1890ff;
  }
`;

type Props = {
  items: Suggest[];
  close: Function;
};

export default class SuggestPanel extends PureComponent<Props> {
  rootRef: { current: any } = createRef();

  private addListenerTimeout: number | undefined = undefined;

  componentDidMount() {
    this.addListenerTimeout = setTimeout(() => {
      document.addEventListener('click', this.onAwayClick);
    }, 200);
  }

  componentWillUnmount() {
    clearTimeout(this.addListenerTimeout);
    document.removeEventListener('click', this.onAwayClick);
  }

  onAwayClick = (e: any) => {
    if (!this.rootRef.current.contains(e.target)) {
      this.props.close();
    }
  };

  onItemClick = () => {
    this.props.close();
  };

  getRoute({ type, data }: Suggest) {
    switch (type) {
      case 'block':
        return `/block/${data.id}`;
      case 'transaction':
        return `/trx/${data.id}`;
      default:
        throw new Error('Unknown type');
    }
  }

  renderItem = (item: Suggest, i: number) => {
    return (
      <Item key={i}>
        <LinkStyled to={this.getRoute(item)} onClick={this.onItemClick}>
          {SYMBOLS_BY_TYPE[item.type]} {item.data.id}
        </LinkStyled>
      </Item>
    );
  };

  render() {
    const { items } = this.props;

    return (
      <Wrapper ref={this.rootRef}>
        <List>{items.map(this.renderItem)}</List>
      </Wrapper>
    );
  }
}
