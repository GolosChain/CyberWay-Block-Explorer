import React from 'react';
import { Route } from 'react-router-dom';

import { AccountTransactionsMode } from '../types';
import Home from '../pages/Home';
import Feed from '../pages/Feed';
import Block from '../pages/Block';
import Transaction from '../pages/Transaction';
import Account from '../pages/Account';
import Accounts from '../pages/Accounts';

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
      <Route path="/block/:blockId" exact component={Block} />
      <Route path="/trx/:transactionId" exact component={Transaction} />
      <Route path="/accounts" exact component={Accounts} />
      <Route path="/account/:accountId/:mode(actor|mention)?" exact component={Account} />
    </>
  );
}
