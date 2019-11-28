import React, { ComponentType } from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';

import { AccountTransactionsMode } from '../types';
import Home from '../pages/Home';
import Feed from '../pages/Feed';
import Block from '../pages/Block';
import Transaction from '../pages/Transaction';
import Account from '../pages/Account';
import Proposal from '../pages/Proposal';
import Validators from '../pages/Validators';
import Tokens from '../pages/Tokens';
import Token from '../pages/Token';
import Sign from '../pages/Sign';
import Contract from '../pages/Contract';

export type BlockRouteParams = {
  blockId: string;
};

export type TransactionRouteParams = {
  transactionId: string;
};

export type AccountRouteParams = {
  name: string; // now it accepts account names + usernames/domains
  mode?: AccountTransactionsMode;
};

export type ProposalRouteParams = {
  account: string;
  proposal: string;
  version?: string; // it's number, but router can't
};

export type TokenRouteParams = {
  symbol: string;
};

export type ContractRouteParams = {
  account: string;
};

export default function() {
  return (
    <>
      <Route path="/" exact component={Home} />
      <Route path="/feed" exact component={Feed} />
      <Route path="/block/:blockId" exact component={wrapKeySetter(Block)} />
      <Route path="/trx/:transactionId" exact component={wrapKeySetter(Transaction)} />
      <Route path="/validators" exact component={Validators} />
      <Route path="/tokens" exact component={Tokens} />
      <Route path="/token/:symbol" exact component={wrapKeySetter(Token)} />
      <Route path="/sign" component={wrapKeySetter(Sign)} />
      <Route path="/account/:name/:mode(actor|mention)?" exact component={wrapKeySetter(Account)} />
      <Route path="/account/:account/contract" exact component={wrapKeySetter(Contract)} />
      <Route
        path="/account/:account/proposal/:proposal/:version?"
        exact
        component={wrapKeySetter(Proposal, ['version'])}
      />
    </>
  );
}

// Key выставляется для того, чтобы при навигации создавался новый компонент.
// В противном случае компонент продолжает отображать прошлое состояние.
// Параметр exclude позволяет исключить некоторые свойства из генерации ключа
// (используется например в Proposal kоя перезода по страницам без  доп.загрузки).
function wrapKeySetter(Comp: ComponentType<any>, exclude: string[] = []) {
  const kill: any = {};
  for (const field of exclude) {
    kill[field] = undefined;
  }
  return (props: RouteComponentProps) => (
    <Comp key={JSON.stringify({ ...props.match.params, ...kill })} {...props} />
  );
}
