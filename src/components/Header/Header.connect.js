import { connect } from 'react-redux';

import Header from './Header';

export default connect(state => ({
  blockchainHost: state.blockchain.blockchainHost,
}))(Header);
