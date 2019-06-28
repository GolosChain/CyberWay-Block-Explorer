import { connect } from 'react-redux';

import { State } from '../../store';
import { loadBlockChainInfo } from '../../store/actions';

import BlockChainStatus from './BlockChainStatus';

export default connect(
  (state: State) => ({
    blockchainInfo: state.blockchain,
  }),
  {
    loadBlockChainInfo,
  }
)(BlockChainStatus);
