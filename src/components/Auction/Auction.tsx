import React, {
  PureComponent,
  RefObject,
  createRef,
  ChangeEvent,
  MouseEvent,
  FormEvent,
} from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';
import { LoadBidsParams, LoadLastBidParams } from './Auction.connect';
import AccountName from '../AccountName';
import Link from '../Link';
import { FieldTitle, Field } from '../Form';
import { COLORS } from '../../utils/theme';
import { formatCyber } from '../../utils/cyberway';
import { checkWin, domainCheckWin, bidName, domainBid } from '../../utils/cyberwayActions';
import { AuctionInfo, BidInfo, AuctionKind } from '../../types';

const NEXT_WIN_DELAY = 1000 * 60 * 60 * 24;

const Wrapper = styled.div``;

const SubTitle = styled.h3`
  border-top: 1px solid #eee;
  padding: 12px 0;
  margin-top: 12px;
  color: #888;
`;

const Table = styled.table`
  width: 100%;
  max-width: 1000px;
  border: 1px solid #ddd;

  & thead {
    background: #eee;
  }

  & tbody tr:first-child {
    background: #ffb;
    font-weight: bold;
  }

  & tbody td:last-child {
    text-align: right;
    font-size: 13px;
  }

  & tbody tr:hover {
    background: #ffd;
  }
`;

const BUTTON_STYLE = `
  background: ${COLORS.green};
  color: #fff;
  border-radius: 4px;
  font-weight: bold;
  align-self: center;
  display: inline-block;
  padding: 8px 12px;
  cursor: pointer;
`;

const TrxButton = styled(Link)`
  ${BUTTON_STYLE}
  text-decoration: none;
`;

const BidButton = styled.button`
  ${BUTTON_STYLE}
`;

const FieldName = styled(FieldTitle)`
  display: inline-block;
  min-width: 100px;
`;

export type Props = {
  type: AuctionKind;
  auction: AuctionInfo;
  loadBids: (params: LoadBidsParams) => any;
  loadLastBid: (params: LoadLastBidParams) => any;

  history: any;
};

export type State = {
  actor: string;
};

export default class Auction extends PureComponent<Props, State> {
  state = {
    actor: '',
  };

  bidRef: RefObject<HTMLInputElement> = createRef();
  nameRef: RefObject<HTMLInputElement> = createRef();
  actorRef: RefObject<HTMLInputElement> = createRef();

  componentDidMount() {
    const { loadBids, loadLastBid } = this.props;
    const domain = this.isDomain();

    loadBids({ domain, offset: 0, limit: 50 }).catch((err: Error) => {
      ToastsManager.error(`Failed to load bids: ${err.message}`);
    });
    loadLastBid({ domain }).catch((err: Error) => {
      ToastsManager.error(`Failed to load last closed bid: ${err.message}`);
    });
  }

  isDomain() {
    return this.props.type === 'domain';
  }

  actionsToUrl(actions: any[]) {
    return '/sign?trx=' + encodeURIComponent(JSON.stringify({ actions }));
  }

  actionToUrl(action: any) {
    return this.actionsToUrl([action]);
  }

  winAction() {
    const action = (this.isDomain() ? domainCheckWin : checkWin)(this.state.actor);
    return this.actionToUrl(action);
  }

  onActorChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ actor: e.target.value });
  };

  onWinClick = (e: MouseEvent) => {
    if (!this.state.actor) {
      e.preventDefault();
      if (this.actorRef.current) {
        this.actorRef.current.reportValidity();
      }
    }
  };

  onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const { bidder, name, bid } = (e.target as any).elements;
    const bidCyber = parseFloat(bid.value).toFixed(4) + ' CYBER';
    const action = (this.isDomain() ? domainBid : bidName)(bidder.value, name.value, bidCyber);
    this.props.history.push(this.actionToUrl(action));
  };

  onRowClick({ highBid, name }: BidInfo) {
    if (this.bidRef.current) {
      const bid = Math.round(highBid * 1.1) + 1;
      this.bidRef.current.value = `${bid / 10000}`;
    }
    if (this.nameRef.current) {
      this.nameRef.current.value = name;
    }
  }

  renderNextWinInfo() {
    const { type, auction } = this.props;
    const { bids, lastClosedBid } = auction;
    const { actor } = this.state;

    const canCalculate = bids && lastClosedBid;
    let winMsg = '?';
    let canWin = false;

    if (canCalculate) {
      const highBidTime = new Date((bids![0] || {}).lastBidTime || 0).getTime();
      const delayPoint = Math.max(new Date(lastClosedBid!).getTime(), highBidTime);
      const nextWinTime = new Date(delayPoint + NEXT_WIN_DELAY);
      canWin = new Date() > nextWinTime;
      winMsg = canWin ? 'ready to claim' : `${nextWinTime.toLocaleString()} or later`;
    }

    return (
      <Field line>
        <FieldTitle>Next win time:</FieldTitle> {canCalculate ? winMsg : '?'}
        {canCalculate && canWin ? (
          <div>
            <small>
              Current auction is finished, so any account may close it to continue with next {type}{' '}
              name. It also closes automatically on bid.
            </small>
            <br />
            <span title="Any account may sign transaction">Signer:</span>{' '}
            <input value={actor} required onChange={this.onActorChange} ref={this.actorRef} />{' '}
            <TrxButton to={this.winAction()} onClick={this.onWinClick}>
              Close Auction
            </TrxButton>
          </div>
        ) : null}
      </Field>
    );
  }

  renderActiveBids(bids: BidInfo[]) {
    const { type } = this.props;

    return (
      <>
        <i>Click row to auto-fill bid form for corresponding {type} name.</i>
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>name</th>
              <th>bid</th>
              <th>bidder</th>
              <th>bid time</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((x, i) => (
              <tr key={i} onClick={() => this.onRowClick(x)}>
                <td>{i + 1}</td>
                <td>
                  <b>{x.name}</b>
                </td>
                <td>{formatCyber(x.highBid, true)}</td>
                <td>
                  <AccountName
                    account={{ id: x.highBidder, golosId: x.glsName }}
                    twoLines
                    addLink
                  />
                </td>
                <td>{new Date(x.lastBidTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  render() {
    const { type, auction } = this.props;
    const { bids, lastClosedBid } = auction;
    const title = `Auction of ${type}s`;

    return (
      <Wrapper>
        <Helmet title={title} />
        <SubTitle>Auction state</SubTitle>
        <Field line>
          <FieldTitle>Last closed bid:</FieldTitle>{' '}
          {lastClosedBid ? new Date(lastClosedBid).toLocaleString() : 'Loading…'}
        </Field>
        {this.renderNextWinInfo()}
        <SubTitle>Bid {type} name</SubTitle>
        <form onSubmit={this.onSubmit}>
          <Field line>
            <FieldName>Name to bid:</FieldName>{' '}
            <input name="name" type="text" required ref={this.nameRef} />
          </Field>
          <Field line>
            <FieldName>Bid:</FieldName>{' '}
            <input name="bid" type="number" min=".0001" step=".0001" required ref={this.bidRef} />{' '}
            CYBER
          </Field>
          <Field line>
            <FieldName>Bidder:</FieldName> <input name="bidder" type="text" required />
          </Field>
          <BidButton>Bid {type}</BidButton>
        </form>
        <SubTitle>Active bids</SubTitle>
        {bids ? this.renderActiveBids(bids) : 'Loading…'}
      </Wrapper>
    );
  }
}
