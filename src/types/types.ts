import { Action as ReduxAction } from 'redux';

export type CallApiType = {
  method: string;
  params?: object;
  types?: string[];
  meta?: any;
};

export type Action = ReduxAction & {
  payload?: any;
  error?: ApiError;
  meta?: any;
};

export type ApiError = {
  code: number;
  message: string;
};

export type BlockSummary = {
  id: string;
  parentId: string;
  blockNum: number;
  blockTime: string;
  producer: string;
  counters: {
    transactions: {
      [key: string]: number;
    };
    actions: {
      [key: string]: number;
    };
  };
};

type SuggestType = 'block' | 'transaction' | 'account';

export type Suggest = {
  type: SuggestType;
  data:
    | {
        id: string;
      }
    | AccountLine;
};

export type GrantInfoType = {
  accountId: string;
  username?: string;
  share: number;
  pct: number;
  breakFee: number;
  breakMinStaked: number;
  isCanceled?: boolean;
};

export type GrantsInfoType = {
  updateTime: string;
  items: GrantInfoType[];
};

export type TokenBalanceType = {
  balance: string; // asset type
  payments?: string; // asset type
  account?: string; // account name type
};

export type AgentPropsType = {
  fee: number | null;
  proxyLevel: number | null;
  minStake: number | null;
};

export type ProducingPeriodType = {
  count: number;
  latest: Date;
};

export type ProducingBucketType = {
  bucket: string;
  account: string;
  blocksCount: number;
  missesCount: number;
};

export type ProducingStatsType = {
  buckets: ProducingBucketType[];
  dayBlocks: ProducingPeriodType | undefined;
  weekBlocks: ProducingPeriodType | undefined;
  dayMisses: number | undefined;
  weekMisses: number | undefined;
};

export type AccountType = {
  id: string;
  golosId?: string | null;
  keys?: {
    [keyName: string]: KeyInfo;
  } | null;
};

export type ExtendedAccountType = AccountType & {
  grants: GrantsInfoType | null;
  tokens: TokenBalanceType[] | null;
  agentProps: AgentPropsType | null;
  registrationTime: string | null;
  producingStats: ProducingStatsType;
};

export type AccountLine = {
  id: string;
  golosId: string | null;
};

export type ValidatorType = {
  account: string;
  enabled: boolean;
  latestPick: Date;
  signKey: string;
  votes: number;
  username: string | null;
  percent: number;
  props: AgentPropsType | null;

  produced: number;
  missed: number;
  weekProduced: number;
  weekMissed: number;
  latestBlock: Date | undefined;
};

export type TokenStatType = {
  symbol: string; // symbol type; Note this types are more strict than string
  supply: string; // asset type
  maxSupply: string; // asset type
  nulls: string; // asset type
  funds: string; // asset type
  issuer: string; // account name type
};

export type KeyInfo = {
  threshold: number;
  keys: KeyLine[];
  accounts: any[]; // -- Структура accounts неизвестна
  waits: any[]; // -- Структура waits неизвестна
};

export type KeyLine = {
  key: string;
  weight: number;
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
  args: Object | null;
  data?: string;
  events: ActionEvent[];
};

export type FiltersType = {
  code?: string;
  action?: string;
  actor?: string;
  event?: string;
  nonEmpty?: boolean;
};

export type AuthType = {
  accountId: string;
  key: string;
};

export type KeyRole = 'owner' | 'active' | 'posting';
