import { FETCH_BLOCK_SUCCESS } from "../constants";
import { Action, BlockSummary } from "../../types";

export type State = {
  [key: string]: BlockSummary;
};

const initialState: State = {};

export default function(state = initialState, { type, payload }: Action) {
  switch (type) {
    case FETCH_BLOCK_SUCCESS:
      return {
        ...state,
        [payload.block.id]: payload.block
      };
    default:
      return state;
  }
}
