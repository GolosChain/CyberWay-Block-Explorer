import { FETCH_BLOCK_SUCCESS } from '../constants';

const initialState = {};

export default function(state = initialState, { type, payload }) {
  switch (type) {
    case FETCH_BLOCK_SUCCESS:
      return {
        ...state,
        [payload.block.id]: payload.block,
      };
    default:
      return state;
  }
}
