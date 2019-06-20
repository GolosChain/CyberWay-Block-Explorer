import { connect } from 'react-redux';

import { FETCH_BLOCK_SUCCESS } from '../../store/constants';
import { BlockRouteParams } from '../../routes/Routes';
import { State } from '../../store';
import Connection from '../../utils/Connection';
import Block from './Block';

type Props = {
  match: {
    params: BlockRouteParams;
  };
};

export default connect(
  (state: State, props: Props) => {
    const { blockId } = props.match.params;

    return {
      blockId,
      block: state.blocks[blockId],
    };
  },
  {
    loadBlock: ({ blockId }: { blockId: string }) => async (dispatch: Function) => {
      const block = await Connection.get().callApi('blocks.getBlock', {
        blockId,
      });

      return dispatch({
        type: FETCH_BLOCK_SUCCESS,
        payload: {
          block,
        },
      });
    },
  }
)(Block);
