import { Action as ReduxAction } from 'redux';

export type Action = ReduxAction & {
  payload?: any;
  meta?: any;
};

export type BlockSummary = {
  id: string;
  parentId: string;
  blockNum: number;
  blockTime: Date;
  counters: {
    transactions: {
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
  blockTime: Date;
  status: TransactionStatus;
  stats: TransactionStats;
  actions: TransactionAction[];
};

export type TransactionAction = {};
