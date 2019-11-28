import { FETCH_BLOCK_SUCCESS } from '../constants';
import { Action } from '../../types';

export type State = {
  [key: string]: string;
};

const initialState: State = {};

export default function(state = initialState, { type, payload }: Action): State {
  switch (type) {
    case FETCH_BLOCK_SUCCESS:
      return {
        ...state,
        [payload.block.blockNum]: payload.block.id,
      };
    default:
      return state;
  }
}
