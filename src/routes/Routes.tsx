import React from 'react';
import { Route } from 'react-router-dom';

import BlockFeed from '../pages/BlockFeed';
import Block from '../pages/Block';
import Transaction from '../pages/Transaction';

export type BlockRouteParams = {
  blockId: string;
};

export type TransactionRouteParams = {
  transactionId: string;
};

export default function() {
  return (
    <>
      <Route path="/" exact component={BlockFeed} />
      <Route path="/block/:blockId" exact component={Block} />
      <Route path="/trx/:transactionId" exact component={Transaction} />
    </>
  );
}
