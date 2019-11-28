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
    const { block } = props.match.params;

    let blockId: string | null = block;
    let blockNum: string | null = null;

    if (block.length !== 64 && /^\d+$/.test(block)) {
      blockId = null;
      blockNum = block;
    }

    if (blockNum) {
      blockId = state.blockIdByNum[blockNum];
    }

    return {
      blockId,
      blockNum,
      block: blockId ? state.blocks[blockId] : null,
    };
  },
  {
    loadBlock: ({
      blockId,
      blockNum,
    }: {
      blockId: string | null;
      blockNum: number | null;
    }) => async (dispatch: Function) => {
      const block = await Connection.get().callApi('blocks.getBlock', {
        blockId,
        blockNum,
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
