const initialState = {
  items: [],
};

export default function(state = initialState, { type, payload }) {
  switch (type) {
    case 'FETCH_BLOCKS_SUCCESS':
      return {
        items: payload.blocks,
      };
    default:
      return state;
  }
}
