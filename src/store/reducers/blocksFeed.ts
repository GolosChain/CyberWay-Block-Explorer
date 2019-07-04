import { uniqBy, last, equals } from 'ramda';

import { Action, BlockSummary, FiltersType } from '../../types';

import {
  FETCH_BLOCKS,
  FETCH_BLOCKS_SUCCESS,
  FETCH_BLOCKS_ERROR,
  FETCH_NEW_BLOCKS_SUCCESS,
  CLEAR_FEED_BLOCKS,
  FETCH_NEW_BLOCKS,
} from '../constants';

export type State = {
  isLoading: boolean;
  isEnd: boolean;
  filters: FiltersType;
  currentFilters: FiltersType;
  queueId: number;
  items: BlockSummary[];
};

const initialState: State = {
  isLoading: false,
  isEnd: false,
  filters: {},
  currentFilters: {},
  queueId: 1,
  items: [],
};

export default function(state: State = initialState, { type, payload, meta }: Action) {
  switch (type) {
    case FETCH_BLOCKS:
      let { queueId } = state;

      if (!equals(state.filters, meta.filters)) {
        queueId++;
      }

      meta.queueId = queueId;

      if (meta.fromBlockNum) {
        return {
          ...state,
          filters: meta.filters,
          queueId,
          isLoading: true,
        };
      } else {
        return {
          ...initialState,
          filters: meta.filters,
          queueId,
          isLoading: true,
        };
      }
    case FETCH_BLOCKS_SUCCESS: {
      if (meta.queueId !== state.queueId) {
        return state;
      }

      return {
        ...state,
        isLoading: false,
        currentFilters: meta.filters,
        isEnd: payload.blocks.length < meta.limit,
        items: state.items.concat(payload.blocks),
      };
    }
    case FETCH_BLOCKS_ERROR: {
      if (meta.queueId !== state.queueId) {
        return state;
      }

      return {
        ...state,
        isLoading: false,
        currentFilters: meta.filters,
      };
    }
    case FETCH_NEW_BLOCKS:
      meta.queueId = state.queueId;
      return state;
    case FETCH_NEW_BLOCKS_SUCCESS:
      if (meta.queueId !== state.queueId) {
        return state;
      }

      const lastReceived = last(payload.blocks as BlockSummary[]);
      const firstInList = state.items[0];

      if (firstInList && lastReceived && lastReceived.blockNum > firstInList.blockNum + 1) {
        return {
          ...state,
          isLoading: false,
          isEnd: false,
          items: payload.blocks,
        };
      }

      return {
        ...state,
        items: uniqBy((block: BlockSummary) => block.id, payload.blocks.concat(state.items)),
      };
    case CLEAR_FEED_BLOCKS:
      return initialState;
    default:
      return state;
  }
}
