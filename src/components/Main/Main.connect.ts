import { connect } from 'react-redux';

import { loadBlockChainInfo } from '../../store/actions';

import Main from './Main';

export default connect(
  null,
  {
    loadBlockChainInfo,
  }
)(Main);
