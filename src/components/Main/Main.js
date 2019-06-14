import React, { PureComponent } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
`;

const List = styled.ul``;

const Block = styled.li``;

export default class Main extends PureComponent {
  componentDidMount() {
    this.props.loadBlocks();
  }

  renderBlockLine = block => {
    return <Block key={block.id}>{block.id}</Block>;
  };

  render() {
    const { blocks } = this.props;

    return (
      <Wrapper>
        Blocks:
        <List>{blocks.map(this.renderBlockLine)}</List>
      </Wrapper>
    );
  }
}
