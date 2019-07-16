import { Action as ReduxAction } from 'redux';

export type CallApiType = {
  method: string;
  params?: object;
  types?: string[];
  meta?: any;
};

export type Action = ReduxAction & {
  payload?: any;
  meta?: any;
};

export type BlockSummary = {
  id: string;
  parentId: string;
  blockNum: number;
  blockTime: string;
  counters: {
    transactions: {
      [key: string]: number;
    };
    actions: {
      [key: string]: number;
    };
  };
};

type SuggestType = 'block' | 'transaction';

export type Suggest = {
  type: SuggestType;
  data: {
    id: string;
  };
};

export type TransactionStatus = 'executed' | 'expired' | 'soft_fail';

export type AccountTransactionsMode = 'all' | 'actor' | 'mention';

type TransactionStats = {
  cpu_usage_us: number;
  net_usage_words: number;
  ram_kbytes: number;
  storage_kbytes: number;
};

export type TransactionType = {
  id: string;
  index: number;
  blockId: string;
  blockNum: number;
  blockTime: string;
  status: TransactionStatus;
  stats: TransactionStats;
  actions: TransactionAction[];
};

export type ActionEvent = {
  code: string;
  event: string;
};

export type AuthLine = {
  actor: string;
  permission: string;
};

export type TransactionAction = {
  index: number;
  code: string;
  action: string;
  receiver: string;
  auth: AuthLine[];
  accounts: string[];
  args: Object;
  events: ActionEvent[];
};

export type FiltersType = {
  code?: string;
  action?: string;
  actor?: string;
  event?: string;
  nonEmpty?: boolean;
};

export type AccountType = {
  id: string;
  transactions: TransactionType[];
};
