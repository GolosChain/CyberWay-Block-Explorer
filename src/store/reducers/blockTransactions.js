const initialState = {
  isLoading: false,
  blocks: {},
};

export default function(state = initialState, { type, payload, meta }) {
  switch (type) {
    case 'FETCH_TRANSACTIONS':
      if (meta.fromIndex) {
        return {
          ...state,
          isLoading: true,
        };
      } else {
        return {
          ...initialState,
          isLoading: true,
        };
      }
    case 'FETCH_TRANSACTIONS_SUCCESS':
      let transactions;

      if (meta.fromIndex) {
        transactions = (state.blocks[meta.blockId] || []).concat(payload.transactions);
      } else {
        transactions = payload.transactions;
      }

      return {
        ...state,
        isLoading: false,
        isEnd: payload.transactions.length < meta.limit,
        blocks: {
          ...state.blocks,
          [meta.blockId]: transactions,
        },
      };
    default:
      return state;
  }
}
