export type Action = {
  type: String;
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

export type Dispatch = (arg0: Action) => {};

type SuggestType = 'block' | 'transaction';

export type Suggest = {
  type: SuggestType;
  data: any;
};

export type TransactionStatus = 'executed' | 'expired' | 'soft_fail';

export type TransactionType = {
  id: string;
  index: number;
  blockId: string;
  blockNum: number;
  blockTime: Date;
  status: TransactionStatus;
  stats: any;
  actions: TransactionAction[];
};

export type TransactionAction = {};
