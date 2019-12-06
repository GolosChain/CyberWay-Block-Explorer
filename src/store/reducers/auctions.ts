import { FETCH_BIDS_SUCCESS, FETCH_LAST_CLOSED_BID_SUCCESS } from '../constants';
import { Action, AuctionInfo, BidInfo } from '../../types';

export type State = {
  account: AuctionInfo;
  domain: AuctionInfo;
};

const initialState: State = { account: {}, domain: {} };

export default function(state = initialState, { type, payload, meta }: Action): State {
  if (type !== FETCH_BIDS_SUCCESS && type !== FETCH_LAST_CLOSED_BID_SUCCESS) {
    return state;
  }

  const key = meta.domain ? 'domain' : 'account';
  const auction = state[key];

  switch (type) {
    case FETCH_BIDS_SUCCESS:
      const { items } = payload;
      if (items) {
        items.sort((a: BidInfo, b: BidInfo) => {
          if (a.highBid !== b.highBid) {
            return b.highBid - a.highBid;
          }
          return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        });
      }

      return {
        ...state,
        [key]: { ...auction, bids: items },
      };
    case FETCH_LAST_CLOSED_BID_SUCCESS:
      return {
        ...state,
        [key]: { ...auction, lastClosedBid: payload.lastClosedBid },
      };
    default:
      return state;
  }
}
