import { connect } from 'react-redux';
import { FETCH_TOKEN_BALANCES, FETCH_TOKEN_BALANCES_SUCCESS } from '../../store/constants';
import { CALL_API } from '../../store/middlewares/callApi';
import { State } from '../../store';
import TokenHolders from './TokenHolders';

type Props = {
  symbol: string;
};

export type LOAD_BALANCES_PARAMS_TYPE = {
  symbol: string;
  offset?: number | null;
};

export default connect(
  ({ tokenHolders }: State, props: Props) => {
    const { symbol } = props;
    const { symbol: stateSymbol, items, offset, isLoading } = tokenHolders;

    return {
      items: stateSymbol === symbol ? items : null,
      offset,
      isLoading,
    };
  },
  {
    loadTokenBalances: ({ symbol, offset }: LOAD_BALANCES_PARAMS_TYPE) => {
      const params = {
        token: symbol,
        offset,
        limit: offset ? 20 : 40,
      };

      return {
        type: CALL_API,
        method: 'stateReader.getTopBalances',
        params,
        types: [FETCH_TOKEN_BALANCES, FETCH_TOKEN_BALANCES_SUCCESS, null],
        meta: { ...params },
      };
    },
  }
)(TokenHolders);
