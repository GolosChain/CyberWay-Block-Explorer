import { Action, TokenBalanceType } from '../../types';
import { FETCH_TOKEN_BALANCES, FETCH_TOKEN_BALANCES_SUCCESS } from '../constants';

export type State = {
  isLoading: boolean;
  queueId: number;
  symbol: string | null;
  offset: number;
  items: TokenBalanceType[];
};

const initialState: State = {
  isLoading: false,
  queueId: 1,
  symbol: null,
  offset: 0,
  items: [],
};

export default function(state: State = initialState, { type, payload, meta }: Action): State {
  switch (type) {
    case FETCH_TOKEN_BALANCES:
      const sameToken = state.symbol === meta.token;
      let { queueId } = state;

      if (!sameToken) {
        queueId++;
      }

      meta.queueId = queueId;

      const base = meta.offset && sameToken ? state : initialState;
      return { ...base, queueId, isLoading: true };

    case FETCH_TOKEN_BALANCES_SUCCESS:
      if (meta.queueId !== state.queueId) {
        return state;
      }

      const items = (meta.offset ? state.items : []).concat(payload.items);

      return {
        ...state,
        isLoading: false,
        symbol: meta.token,
        offset: (meta.offset || 0) + meta.limit,
        items,
      };
    default:
      return state;
  }
}
