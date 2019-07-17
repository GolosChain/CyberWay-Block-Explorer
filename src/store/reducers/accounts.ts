import { Action, AccountLine } from '../../types';
import { FETCH_ACCOUNTS, FETCH_ACCOUNTS_SUCCESS } from '../constants';

export type State = {
  isLoading: boolean;
  lastRequestId: number;
  lastReceivedId: number;
  items: AccountLine[];
};

const initialState: State = {
  isLoading: false,
  lastRequestId: 0,
  lastReceivedId: 0,
  items: [],
};

export default function(state: State = initialState, { type, payload, meta }: Action): State {
  switch (type) {
    case FETCH_ACCOUNTS:
      meta.requestId = state.lastRequestId + 1;

      return {
        ...initialState,
        lastRequestId: state.lastRequestId + 1,
        isLoading: true,
      };
    case FETCH_ACCOUNTS_SUCCESS:
      if (meta.requestId <= state.lastReceivedId) {
        return state;
      }

      return {
        ...state,
        isLoading: false,
        lastReceivedId: meta.requestId,
        items: payload.items,
      };
    default:
      return state;
  }
}
