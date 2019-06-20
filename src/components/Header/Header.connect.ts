import { connect } from "react-redux";

import { State } from "../../store";

import Header from "./Header";

export default connect((state: State) => ({
  blockchainHost: state.blockchain.blockchainHost
}))(Header);
