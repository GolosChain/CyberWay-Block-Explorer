import { Action, TransactionType } from '../../types';

import { FETCH_TRANSACTION_SUCCESS } from '../constants';

export type State = {
  [key: string]: TransactionType;
};

const initialState: State = {};

export default function(state: State = initialState, { type, payload, meta }: Action): State {
  switch (type) {
    case FETCH_TRANSACTION_SUCCESS:
      for (const action of payload.actions) {
        if (action.data === '') {
          delete action.data;
        }

        if (action.events.length === 0) {
          delete action.events;
        }
      }

      return {
        ...state,
        [payload.id]: payload,
      };
    default:
      return state;
  }
}
