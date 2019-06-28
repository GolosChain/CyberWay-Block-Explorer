import { FETCH_BLOCK_CHAIN_INFO_SUCCESS } from '../constants';
import { Action } from '../../types';

export type State = {
  lastBlockId: string | null;
  lastBlockNum: number | null;
  irreversibleBlockNum: number | null;
  totalTransactions: number | null;
  blockchainHost: string | null;
};

const initialState: State = {
  lastBlockId: null,
  lastBlockNum: null,
  irreversibleBlockNum: null,
  totalTransactions: 0,
  blockchainHost: null,
};

export default function(state = initialState, { type, payload }: Action) {
  switch (type) {
    case FETCH_BLOCK_CHAIN_INFO_SUCCESS:
      return {
        lastBlockId: payload.lastBlockId,
        lastBlockNum: payload.lastBlockNum,
        irreversibleBlockNum: payload.irreversibleBlockNum,
        totalTransactions: payload.totalTransactions,
        blockchainHost: payload.blockchainHost,
      };
    default:
      return state;
  }
}
