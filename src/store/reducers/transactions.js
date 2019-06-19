const initialState = {};

export default function(state = initialState, { type, payload, meta }) {
  switch (type) {
    case 'FETCH_TRANSACTION_SUCCESS':
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
