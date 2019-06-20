import { FETCH_BLOCK_CHAIN_INFO_SUCCESS } from '../constants';

const initialState = {
  blockchainHost: null,
};

export default function(state = initialState, { type, payload }) {
  switch (type) {
    case FETCH_BLOCK_CHAIN_INFO_SUCCESS:
      return {
        blockchainHost: payload.blockchainHost,
      };
    default:
      return state;
  }
}
