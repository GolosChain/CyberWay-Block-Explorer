import React, { ComponentType } from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';

import { AccountTransactionsMode } from '../types';
import Home from '../pages/Home';
import Feed from '../pages/Feed';
import Block from '../pages/Block';
import Transaction from '../pages/Transaction';
import Account from '../pages/Account';
import Validators from '../pages/Validators';

export type BlockRouteParams = {
  blockId: string;
};

export type TransactionRouteParams = {
  transactionId: string;
};

export type AccountRouteParams = {
  accountId: string;
  mode?: AccountTransactionsMode;
};

export default function() {
  return (
    <>
      <Route path="/" exact component={Home} />
      <Route path="/feed" exact component={Feed} />
      <Route path="/block/:blockId" exact component={wrapKeySetter(Block)} />
      <Route path="/trx/:transactionId" exact component={wrapKeySetter(Transaction)} />
      <Route path="/validators" exact component={Validators} />
      <Route
        path="/account/:accountId/:mode(actor|mention)?"
        exact
        component={wrapKeySetter(Account)}
      />
    </>
  );
}

// Key выставляется для того, чтобы при навигации создавался новый компонент.
// В противном случае компонент продолжает отображать прошлое состояние.
function wrapKeySetter(Comp: ComponentType<any>) {
  return (props: RouteComponentProps) => (
    <Comp key={JSON.stringify(props.match.params)} {...props} />
  );
}
