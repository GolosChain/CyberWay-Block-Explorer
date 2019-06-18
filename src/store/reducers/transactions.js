const initialState = {};

export default function(state = initialState, { type, payload, meta }) {
  switch (type) {
    case 'FETCH_TRANSACTION_SUCCESS':
      return {
        ...state,
        [payload.id]: payload,
      };
    default:
      return state;
  }
}
