import React, { PureComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';

const Wrapper = styled.div``;

const Titles = styled.div`
  display: flex;
`;

const Content = styled.div``;
const Empty = styled.div``;

const TabHead = styled.a<{ active?: boolean }>`
  display: block;
  padding: 6px 0;
  margin: 6px 12px 6px 0;
  color: #bbb;
  border: 0px solid #bbb;
  border-bottom-width: 3px;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    color: #000;
  }

  ${is('active')`
    color: #333;
    border-color: #333
  `};
`;

const TabBody = styled.div``;

type Props = {
  active?: number;
  emptyText?: string;
};

type State = {
  active: number; // Note: it's either -1 or index of current page
};

export default class Tabs extends PureComponent<Props, State> {
  state = {
    active: -1,
  };

  componentDidMount() {
    const { active } = this.props;
    if (active != null) {
      this.setState({ active });
    }
  }

  tabSelect(active: number) {
    this.setState({ active });
  }

  renderTitles = () => {
    return React.Children.map(this.props.children, (item, i) => {
      if (i % 2 === 0) {
        const active = this.state.active * 2 === i;
        return (
          <TabHead onClick={() => this.tabSelect(i / 2)} active={active}>
            {item}
          </TabHead>
        );
      }
    });
  };

  renderContent() {
    const { emptyText, children } = this.props;
    const { active } = this.state;
    return active < 0 ? (
      <Empty>{emptyText}</Empty>
    ) : (
      <TabBody>{React.Children.toArray(children)[active * 2 + 1]}</TabBody>
    );
  }

  render() {
    return (
      <Wrapper>
        <Titles>{this.renderTitles()}</Titles>
        <Content>{this.renderContent()}</Content>
      </Wrapper>
    );
  }
}
