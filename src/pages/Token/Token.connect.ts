import { connect } from 'react-redux';
import { CALL_API } from '../../store/middlewares/callApi';
import { State } from '../../store';
import Token from './Token';
import { TokenRouteParams } from '../../routes/Routes';

type Props = {
  match: {
    params: TokenRouteParams;
  };
};

export type LoadTokenParams = {};

export default connect(
  (state: State, props: Props) => {
    const { symbol } = props.match.params;

    return { symbol };
  },
  {
    loadTokens: (params: LoadTokenParams) => ({
      type: CALL_API,
      method: 'chain.getTokensExt',
      params,
      meta: { ...params },
    }),
  }
)(Token);
