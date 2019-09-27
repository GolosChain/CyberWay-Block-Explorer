import { connect } from 'react-redux';
import { CALL_API } from '../../store/middlewares/callApi';
import Tokens from './Tokens';

export type LoadTokensParams = {};

export default connect(
  null,
  {
    loadTokens: (params: LoadTokensParams) => ({
      type: CALL_API,
      method: 'stateReader.getTokens',
      params,
      meta: { ...params },
    }),
  }
)(Tokens);
