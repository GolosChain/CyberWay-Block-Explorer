import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { last } from 'ramda';
// @ts-ignore
import ToastsManager from 'toasts-manager';

import {
  FETCH_BLOCKS,
  FETCH_BLOCKS_SUCCESS,
  FETCH_BLOCKS_ERROR,
  FETCH_NEW_BLOCKS_SUCCESS,
  CLEAR_FEED_BLOCKS,
  FETCH_NEW_BLOCKS,
} from '../../store/constants';
import { FiltersType } from '../../types';
import { State } from '../../store';
import Connection from '../../utils/Connection';

import BlockFeed from './BlockFeed';

export default connect(
  (state: State) => {
    const { filters } = state;
    const { items, isLoading, isEnd, currentFilters } = state.blocksFeed;

    const lastBlock = last(items);

    return {
      lastBlockNum: lastBlock ? lastBlock.blockNum : 0,
      isLoading,
      isEnd,
      blocks: items,
      currentFilters,
      filters,
    };
  },
  {
    loadBlocks: ({
      fromBlockNum = undefined,
      code,
      action,
      actor,
      nonEmpty,
    }: {
      fromBlockNum?: number;
      code?: string;
      action?: string;
      actor?: string;
      nonEmpty?: boolean;
    } = {}) => async (dispatch: Dispatch) => {
      const meta = {
        fromBlockNum,
        limit: 20,
        filters: {
          code,
          action,
          actor,
          nonEmpty,
        },
      };

      dispatch({
        type: FETCH_BLOCKS,
        meta,
      });

      let results;

      try {
        results = await Connection.get().callApi('blocks.getBlockList', {
          fromBlockNum,
          limit: 20,
          ...meta.filters,
        });
      } catch (err) {
        console.error(err);
        ToastsManager.error(`Request failed: ${err.message}`);

        dispatch({
          type: FETCH_BLOCKS_ERROR,
          meta,
        });
        return;
      }

      dispatch({
        type: FETCH_BLOCKS_SUCCESS,
        payload: {
          blocks: results.blocks,
        },
        meta,
      });
    },
    loadNewBlocks: ({ code, action, actor, nonEmpty }: FiltersType) => async (
      dispatch: Dispatch
    ) => {
      const meta = {
        limit: 5,
        filters: {
          code,
          action,
          actor,
          nonEmpty,
        },
      };

      dispatch({
        type: FETCH_NEW_BLOCKS,
        meta,
      });

      const { blocks } = await Connection.get().callApi('blocks.getBlockList', {
        limit: 5,
        ...meta.filters,
      });

      dispatch({
        type: FETCH_NEW_BLOCKS_SUCCESS,
        payload: {
          blocks,
        },
        meta,
      });
    },
    clearData: () => ({
      type: CLEAR_FEED_BLOCKS,
    }),
  }
)(BlockFeed);
