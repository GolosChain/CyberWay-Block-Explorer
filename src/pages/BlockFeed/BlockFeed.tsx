import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
// @ts-ignore
import ToastsManager from 'toasts-manager';

import { BlockSummary } from '../../types';

const CHECK_NEW_BLOCKS_EVERY = 3000;

const Wrapper = styled.div`
  margin: 16px;
`;

const Title = styled.h1``;

const ListWrapper = styled.div`
  display: flex;
`;

const List = styled.ul``;

const Block = styled.li``;

const LinkStyled = styled(Link)`
  display: block;
  margin: 4px 0;
  font-size: 14px;
  color: unset;
  text-decoration: none;
`;

const BlockNum = styled.span``;

const BlockId = styled.span`
  font-family: monospace;
`;

type Props = {
  isLoading: boolean;
  lastBlockNum: number;
  blocks: BlockSummary[];
  loadNewBlocks: Function;
  clearData: Function;
  loadBlocks: Function;
};

type State = {
  stopNewBlockUpdating: boolean;
};

export default class BlockFeed extends PureComponent<Props, State> {
  state = {
    stopNewBlockUpdating: false,
  };

  private _refreshInterval: number | undefined = undefined;

  componentWillMount() {
    const { clearData } = this.props;
    clearData();
  }

  componentDidMount() {
    this.startAutoUpdating();

    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  componentWillUnmount() {
    clearInterval(this._refreshInterval);
  }

  onVisibilityChange = () => {
    if (document.hidden) {
      this.stopAutoUpdating();
    } else {
      this.checkNewBlocks();
      this.startAutoUpdating();
    }
  };

  startAutoUpdating() {
    this._refreshInterval = setInterval(this.checkNewBlocks, CHECK_NEW_BLOCKS_EVERY);
  }

  stopAutoUpdating() {
    clearInterval(this._refreshInterval);
  }

  checkNewBlocks = () => {
    const { isLoading, loadNewBlocks } = this.props;

    if (!isLoading) {
      loadNewBlocks();
    }
  };

  onLoadMore = async () => {
    const { isLoading, lastBlockNum, loadBlocks } = this.props;

    if (isLoading) {
      return;
    }

    try {
      const query: any = {};

      if (lastBlockNum) {
        query.fromBlockNum = lastBlockNum - 1;
      }

      await loadBlocks(query);
    } catch (err) {
      ToastsManager.error(`Failed: ${err.message}`);
    }
  };

  renderBlockLine = (block: BlockSummary) => {
    return (
      <Block key={block.id}>
        <LinkStyled to={`/block/${block.id}`}>
          <BlockNum>({block.blockNum})</BlockNum> <BlockId>{block.id}</BlockId> (txs:{' '}
          {block.counters.transactions.total})
        </LinkStyled>
      </Block>
    );
  };

  render() {
    const { blocks } = this.props;

    return (
      <Wrapper>
        <Title>Blocks feed:</Title>
        <ListWrapper>
          <InfiniteScroll hasMore={true} loadMore={this.onLoadMore}>
            <List>{blocks.map(this.renderBlockLine)}</List>
          </InfiniteScroll>
        </ListWrapper>
      </Wrapper>
    );
  }
}
