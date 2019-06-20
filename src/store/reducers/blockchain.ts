import { FETCH_BLOCK_CHAIN_INFO_SUCCESS } from "../constants";
import { Action } from "../../types";

export type State = {
  blockchainHost: string | null;
};

const initialState: State = {
  blockchainHost: null
};

export default function(state = initialState, { type, payload }: Action) {
  switch (type) {
    case FETCH_BLOCK_CHAIN_INFO_SUCCESS:
      return {
        blockchainHost: payload.blockchainHost
      };
    default:
      return state;
  }
}
