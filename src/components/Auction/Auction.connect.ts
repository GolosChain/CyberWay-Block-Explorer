import { connect } from 'react-redux';
import { State } from '../../store';
import { FETCH_BIDS_SUCCESS, FETCH_LAST_CLOSED_BID_SUCCESS } from '../../store/constants';
import { CALL_API } from '../../store/middlewares/callApi';
import { AuctionKind } from '../../types';
import Auction from './Auction';

type Props = {
  type: AuctionKind;
};

export type LoadBidsParams = { domain: boolean; offset: number; limit: number };
export type LoadLastBidParams = { domain: boolean };

export default connect(
  (state: State, props: Props) => {
    const { type } = props;
    return { type, auction: state.auctions[type] };
  },
  {
    loadBids: (params: LoadBidsParams) => {
      return {
        type: CALL_API,
        method: 'stateReader.getNameBids',
        params,
        types: [null, FETCH_BIDS_SUCCESS, null],
        meta: { ...params },
      };
    },
    loadLastBid: (params: LoadLastBidParams) => {
      return {
        type: CALL_API,
        method: 'stateReader.getLastClosedBid',
        params,
        types: [null, FETCH_LAST_CLOSED_BID_SUCCESS, null],
        meta: { ...params },
      };
    },
  }
)(Auction);
