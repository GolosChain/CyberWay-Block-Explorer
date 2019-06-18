import { connect } from 'react-redux';

import Connection from '../../utils/Connection';
import Block from './Block';

export default connect(
  (state, props) => {
    const { blockId } = props.match.params;

    return {
      blockId,
      block: state.blocks[blockId],
    };
  },
  {
    loadBlock: ({ blockId }) => async dispatch => {
      const block = await Connection.get().callApi('blocks.getBlock', {
        blockId,
      });

      return dispatch({
        type: 'FETCH_BLOCK_SUCCESS',
        payload: {
          block,
        },
      });
    },
  }
)(Block);
