import React, { PureComponent } from 'react';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroller';
import ToastsManager from 'toasts-manager';

import { BlockSummary, FiltersType } from '../../types';
import Link from '../Link';
import CurrentFilters from '../CurrentFilters';
import LoaderIndicator from '../LoaderIndicator';

const CHECK_NEW_BLOCKS_EVERY = 3000;

const Wrapper = styled.div``;

const TitleLine = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled.h1`
  margin: 12px 10px 12px 0;
`;

const LoaderIndicatorStyled = styled(LoaderIndicator)`
  margin-bottom: -2px;
`;

const ListContainer = styled.div`
  display: flex;
`;

const ListWrapper = styled.div``;

const List = styled.ul``;

const Block = styled.li``;

const LinkStyled = styled(Link)`
  display: block;
  padding: 3px 0;
  font-size: 14px;
  color: unset;
  text-decoration: none;
`;

const BlockNum = styled.span`
  font-family: monospace;
`;

const BlockId = styled.span`
  font-family: monospace;
`;

const Time = styled.span`
  font-family: monospace;
  color: #6a6a6a;

  &:hover {
    color: #000;
  }
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
  isAutoRefresh: boolean;
};

export default class BlockFeed extends PureComponent<Props, State> {
  state = {
    stopNewBlockUpdating: false,
    isAutoRefresh: true,
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
    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    clearInterval(this._refreshInterval);
    clearTimeout(this._resumeUpdateTimeout);

    this.setState({
      isAutoRefresh: false,
    });
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

    this.setState({
      isAutoRefresh: true,
    });
  }

  stopAutoUpdating() {
    clearInterval(this._refreshInterval);

    this.setState({
      isAutoRefresh: false,
    });
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
    const date = new Date(block.blockTime);

    return (
      <Block key={block.id}>
        <LinkStyled to={`/block/${block.id}`} keepHash>
          <Time title={date.toLocaleString()}>{formatTime(date)}</Time>{' '}
          <BlockNum>({block.blockNum})</BlockNum> <BlockId>{block.id}</BlockId> (txs:{' '}
          {block.counters.transactions.total}, actions: {block.counters.actions.count})
        </LinkStyled>
      </Block>
    );
  };

  render() {
    const { blocks, isLoading, isEnd, currentFilters } = this.props;
    const { isAutoRefresh } = this.state;

    return (
      <Wrapper>
        <TitleLine>
          <Title>Block feed:</Title> {isAutoRefresh ? <LoaderIndicatorStyled /> : null}
        </TitleLine>
        <ListContainer>
          <ListWrapper>
            <CurrentFilters filters={currentFilters} />
            <InfiniteScroll hasMore={!isEnd} loadMore={this.onLoadMore}>
              {blocks.length ? (
                <List onMouseMove={this.onMouseMove}>{blocks.map(this.renderBlockLine)}</List>
              ) : isLoading ? (
                'Loading ...'
              ) : currentFilters ? (
                'Nothing is found'
              ) : (
                'No blocks'
              )}
            </InfiniteScroll>
          </ListWrapper>
        </ListContainer>
      </Wrapper>
    );
  }
}

function formatTime(date: Date) {
  return `${nn(date.getHours())}:${nn(date.getMinutes())}:${nn(date.getSeconds())}`;
}

function nn(value: number) {
  if (value < 10) {
    return `0${value}`;
  }

  return String(value);
}
