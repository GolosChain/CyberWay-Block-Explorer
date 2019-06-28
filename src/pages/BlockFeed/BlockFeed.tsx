import React, { PureComponent } from 'react';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroller';
// @ts-ignore
import ToastsManager from 'toasts-manager';

import { BlockSummary, FiltersType } from '../../types';
import Link from '../../components/Link';
import CurrentFilters from '../../components/CurrentFilters';

const CHECK_NEW_BLOCKS_EVERY = 3000;

const Wrapper = styled.div`
  margin: 16px;
`;

const Title = styled.h1`
  margin: 12px 0;
`;

const ListContainer = styled.div`
  display: flex;
`;

const ListWrapper = styled.div``;

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
  isEnd: boolean;
  lastBlockNum: number;
  blocks: BlockSummary[];
  filters: FiltersType;
  currentFilters: FiltersType;
  loadBlocks: Function;
  loadNewBlocks: Function;
  clearData: Function;
};

type State = {
  stopNewBlockUpdating: boolean;
};

export default class BlockFeed extends PureComponent<Props, State> {
  state = {
    stopNewBlockUpdating: false,
  };

  private _resumeUpdateTimeout: number | undefined;

  private _refreshInterval: number | undefined;

  componentWillMount() {
    const { clearData } = this.props;
    clearData();
  }

  componentDidMount() {
    this.startAutoUpdating();

    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  componentWillReceiveProps(nextProps: Readonly<Props>) {
    const props = this.props;

    if (props.filters !== nextProps.filters) {
      setTimeout(() => {
        this.load();
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this._refreshInterval);
    clearTimeout(this._resumeUpdateTimeout);
  }

  onVisibilityChange = () => {
    clearTimeout(this._resumeUpdateTimeout);

    if (document.hidden) {
      this.stopAutoUpdating();
    } else {
      this.checkNewBlocks();
      this.startAutoUpdating();
    }
  };

  startAutoUpdating() {
    clearTimeout(this._resumeUpdateTimeout);
    this._refreshInterval = setInterval(this.checkNewBlocks, CHECK_NEW_BLOCKS_EVERY);
  }

  stopAutoUpdating() {
    clearInterval(this._refreshInterval);
  }

  checkNewBlocks = () => {
    const { isLoading, filters, loadNewBlocks } = this.props;

    if (!isLoading) {
      loadNewBlocks(filters);
    }
  };

  onLoadMore = () => {
    const { isLoading, isEnd } = this.props;

    if (isLoading || isEnd) {
      return;
    }

    this.load(true);
  };

  async load(isMore = false) {
    const { lastBlockNum, filters, loadBlocks } = this.props;

    try {
      const query: { fromBlockNum?: number; code?: string; action?: string; nonEmpty?: boolean } = {
        ...filters,
      };

      if (lastBlockNum && isMore) {
        query.fromBlockNum = lastBlockNum - 1;
      }

      await loadBlocks(query);
    } catch (err) {
      ToastsManager.error(`Failed: ${err.message}`);
    }
  }

  onMouseMove = () => {
    this.stopAutoUpdating();

    clearTimeout(this._resumeUpdateTimeout);

    this._resumeUpdateTimeout = setTimeout(() => {
      this.startAutoUpdating();
    }, 2000);
  };

  renderBlockLine = (block: BlockSummary) => {
    return (
      <Block key={block.id}>
        <LinkStyled to={`/block/${block.id}`} keepHash>
          <BlockNum>({block.blockNum})</BlockNum> <BlockId>{block.id}</BlockId> (txs:{' '}
          {block.counters.transactions.total})
        </LinkStyled>
      </Block>
    );
  };

  render() {
    const { blocks, isLoading, isEnd, currentFilters } = this.props;

    return (
      <Wrapper>
        <Title>Block feed:</Title>
        <ListContainer>
          <ListWrapper>
            <CurrentFilters filters={currentFilters} />
            <InfiniteScroll hasMore={!isEnd} loadMore={this.onLoadMore}>
              {blocks.length ? (
                <List onMouseMove={this.onMouseMove}>{blocks.map(this.renderBlockLine)}</List>
              ) : isLoading ? null : (
                'No blocks'
              )}
            </InfiniteScroll>
          </ListWrapper>
        </ListContainer>
      </Wrapper>
    );
  }
}
