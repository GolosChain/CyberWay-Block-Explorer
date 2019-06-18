import { uniqBy, last } from 'ramda';

const initialState = {
  isLoading: false,
  stopUpdateBlocks: false,
  items: [],
};

export default function(state = initialState, { type, payload, meta }) {
  switch (type) {
    case 'FETCH_BLOCKS':
      if (meta.fromBlockNum) {
        return {
          ...state,
          isLoading: true,
        };
      } else {
        return {
          ...initialState,
          isLoading: true,
        };
      }
    case 'FETCH_BLOCKS_SUCCESS':
      return {
        isLoading: false,
        items: state.items.concat(payload.blocks),
        stopUpdateBlocks: meta.fromBlockNum ? state.stopUpdateBlocks : false,
      };
    case 'FETCH_BLOCKS_ERROR':
      return {
        ...state,
        isLoading: false,
      };
    case 'FETCH_NEW_BLOCKS_SUCCESS':
      const lastReceived = last(payload.blocks);
      const firstInList = state.items[0];

      if (firstInList && lastReceived.blockNum > firstInList.blockNum + 1) {
        return {
          ...state,
          stopUpdateBlocks: true,
        };
      }

      return {
        ...state,
        items: uniqBy(block => block.id, payload.blocks.concat(state.items)),
      };
    default:
      return state;
  }
}
