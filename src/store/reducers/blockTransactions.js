const initialState = {};

export default function(state = initialState, { type, payload, meta }) {
  switch (type) {
    case 'FETCH_TRANSACTIONS_SUCCESS':
      return {
        ...state,
        [meta.blockId]: payload,
      };
    default:
      return state;
  }
}
