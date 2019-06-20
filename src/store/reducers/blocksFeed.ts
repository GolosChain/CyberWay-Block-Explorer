import { uniqBy, last } from "ramda";

import { Action, BlockSummary } from "../../types";

import {
  FETCH_BLOCKS,
  FETCH_BLOCKS_SUCCESS,
  FETCH_BLOCKS_ERROR,
  FETCH_NEW_BLOCKS_SUCCESS,
  CLEAR_FEED_BLOCKS
} from "../constants";

export type State = {
  isLoading: boolean;
  items: BlockSummary[];
};

const initialState: State = {
  isLoading: false,
  items: []
};

export default function(
  state: State = initialState,
  { type, payload, meta }: Action
) {
  switch (type) {
    case FETCH_BLOCKS:
      if (meta.fromBlockNum) {
        return {
          ...state,
          isLoading: true
        };
      } else {
        return {
          ...initialState,
          isLoading: true
        };
      }
    case FETCH_BLOCKS_SUCCESS:
      return {
        isLoading: false,
        items: state.items.concat(payload.blocks)
      };
    case FETCH_BLOCKS_ERROR:
      return {
        ...state,
        isLoading: false
      };
    case FETCH_NEW_BLOCKS_SUCCESS:
      const lastReceived: any = last(payload.blocks);
      const firstInList = state.items[0];

      if (firstInList && lastReceived.blockNum > firstInList.blockNum + 1) {
        return {
          isLoading: false,
          items: payload.blocks
        };
      }

      return {
        ...state,
        items: uniqBy(
          (block: BlockSummary) => block.id,
          payload.blocks.concat(state.items)
        )
      };
    case CLEAR_FEED_BLOCKS:
      return initialState;
    default:
      return state;
  }
}
