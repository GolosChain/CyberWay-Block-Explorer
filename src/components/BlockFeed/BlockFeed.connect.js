import { connect } from 'react-redux';
import { last } from 'ramda';
import ToastsManager from 'toasts-manager';

import Connection from '../../utils/Connection';
import BlockFeed from './BlockFeed';

export default connect(
  state => {
    const { items, isLoading, stopUpdateBlocks } = state.blocksFeed;

    const lastBlock = last(items);

    return {
      lastBlockNum: lastBlock ? lastBlock.blockNum : 0,
      isLoading,
      stopUpdateBlocks,
      blocks: items,
    };
  },
  {
    loadBlocks: ({ fromBlockNum = undefined } = {}) => async dispatch => {
      const params = {
        fromBlockNum,
        limit: 20,
      };

      dispatch({
        type: 'FETCH_BLOCKS',
        meta: params,
      });

      let results;

      try {
        results = await Connection.get().callApi('blocks.getBlockList', params);
      } catch (err) {
        console.error(err);
        ToastsManager.error(`Request failed:, ${err.message}`);

        dispatch({
          type: 'FETCH_BLOCKS_ERROR',
          meta: params,
        });
        return;
      }

      dispatch({
        type: 'FETCH_BLOCKS_SUCCESS',
        payload: {
          blocks: results.blocks,
        },
        meta: params,
      });
    },
    loadNewBlocks: () => async dispatch => {
      const { blocks } = await Connection.get().callApi('blocks.getBlockList', {
        limit: 5,
      });

      dispatch({
        type: 'FETCH_NEW_BLOCKS_SUCCESS',
        payload: {
          blocks,
        },
      });
    },
  }
)(BlockFeed);
