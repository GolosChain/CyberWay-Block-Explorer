import { connect } from 'react-redux';

import Connection from '../../utils/Connection';
import Main from './Main';

export default connect(
  state => ({
    blocks: state.blocks.items,
  }),
  {
    loadBlocks: () => async dispatch => {
      const { blocks } = await Connection.get().callApi('blocks.getBlockList');

      return dispatch({
        type: 'FETCH_BLOCKS_SUCCESS',
        payload: {
          blocks,
        },
      });
    },
  }
)(Main);
