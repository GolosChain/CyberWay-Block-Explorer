import { connect } from "react-redux";
import { last } from "ramda";
// @ts-ignore
import ToastsManager from "toasts-manager";

import {
  FETCH_BLOCKS,
  FETCH_BLOCKS_SUCCESS,
  FETCH_BLOCKS_ERROR,
  FETCH_NEW_BLOCKS_SUCCESS,
  CLEAR_FEED_BLOCKS
} from "../../store/constants";
import { Dispatch } from "../../types";
import { State } from "../../store";
import Connection from "../../utils/Connection";

import BlockFeed from "./BlockFeed";

export default connect(
  (state: State) => {
    const { items, isLoading } = state.blocksFeed;

    const lastBlock = last(items);

    return {
      lastBlockNum: lastBlock ? lastBlock.blockNum : 0,
      isLoading,
      blocks: items
    };
  },
  {
    loadBlocks: ({ fromBlockNum = undefined }: any = {}) => async (
      dispatch: Function
    ) => {
      const params = {
        fromBlockNum,
        limit: 20
      };

      dispatch({
        type: FETCH_BLOCKS,
        meta: params
      });

      let results;

      try {
        results = await Connection.get().callApi("blocks.getBlockList", params);
      } catch (err) {
        console.error(err);
        ToastsManager.error(`Request failed:, ${err.message}`);

        dispatch({
          type: FETCH_BLOCKS_ERROR,
          meta: params
        });
        return;
      }

      dispatch({
        type: FETCH_BLOCKS_SUCCESS,
        payload: {
          blocks: results.blocks
        },
        meta: params
      });
    },
    loadNewBlocks: () => async (dispatch: Dispatch) => {
      const { blocks } = await Connection.get().callApi("blocks.getBlockList", {
        limit: 5
      });

      dispatch({
        type: FETCH_NEW_BLOCKS_SUCCESS,
        payload: {
          blocks
        }
      });
    },
    clearData: () => ({
      type: CLEAR_FEED_BLOCKS
    })
  }
)(BlockFeed);
