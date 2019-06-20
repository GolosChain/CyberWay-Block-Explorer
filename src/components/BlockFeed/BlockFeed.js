import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import ToastsManager from 'toasts-manager';

const CHECK_NEW_BLOCKS_EVERY = 3000;
const STOP_UPDATING_TIMEOUT = 15 * 60 * 1000;

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

export default class BlockFeed extends PureComponent {
  state = {
    stopNewBlockUpdating: false,
  };

  componentDidMount() {
    this._refreshInterval = setInterval(this.checkNewBlocks, CHECK_NEW_BLOCKS_EVERY);

    this._stopRefreshTimeout = setTimeout(() => {
      this.setState({
        stopNewBlockUpdating: true,
      });
      clearInterval(this._refreshInterval);
    }, STOP_UPDATING_TIMEOUT);
  }

  componentWillUnmount() {
    clearInterval(this._refreshInterval);
    clearTimeout(this._stopRefreshTimeout);
  }

  checkNewBlocks = () => {
    const { isLoading, stopUpdateBlocks, loadNewBlocks } = this.props;

    if (stopUpdateBlocks) {
      clearInterval(this._refreshInterval);
      return;
    }

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
      const query = {};

      if (lastBlockNum) {
        query.fromBlockNum = lastBlockNum - 1;
      }

      await loadBlocks(query);
    } catch (err) {
      ToastsManager.error(`Failed: ${err.message}`);
    }
  };

  renderBlockLine = block => {
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
