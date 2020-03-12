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
  recipient: string;
  username?: string;
  share: number;
  percent: number;
  breakFee: number;
  breakMinStaked: number;
  agent: AgentPropsType;
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
  account: string;
  fee: number;
  proxyLevel: number;
  minOwnStaked: number;
  balance: number;
  proxied: number;
  ownShare: number;
  sharesSum: number;
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
};

export type ExtendedAccountType = AccountType & {
  grants: GrantsInfoType | null;
  tokens: TokenBalanceType[] | null;
  agentProps: AgentPropsType | null;
  registrationTime: string | null;
  producingStats: ProducingStatsType;
  permissions: { [name: string]: BasePermissionType };
  permissionLinks: BasePermissionLink[];
};

export type BasePermissionLink = {
  code: string; // account name
  action: string; // name
  permission: string; // name
};

export type BasePermissionType = {
  auth: AuthorityType;
  parent: string; // name type
  lastUpdated: Date;
};

export type AccountLine = {
  id: string;
  golosId: string | null;
};

export type ValidatorType = {
  account: string;
  enabled: boolean;
  latestPick: Date;
  signingKey: string;
  votes: number;
  username: string | null;
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

export type AuthorityType = {
  threshold: number;
  keys: AuthKeyType[];
  accounts: AuthAccountType[];
  waits: AuthWaitType[];
};

export type PermissionType = {
  name: string; // name type
  auth: AuthorityType;
  children?: PermissionType[];
};

type WeightedAuth = {
  weight: number;
};

export type AuthKeyType = WeightedAuth & {
  key: string;
};
export type AuthAccountType = WeightedAuth & {
  permission: AuthType;
};
export type AuthWaitType = WeightedAuth & {
  waitSec: number;
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

export type AuthType = {
  actor: string;
  permission: string;
};

export type ActionType = {
  account: string;
  name: string;
  authorization: AuthType[];
  data: any;
};

export type TransactionAction = {
  index: number;
  code: string;
  action: string;
  receiver: string;
  auth: AuthType[];
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

// to pass keys to trx signer
export type KeyAuthType = {
  accountId: string;
  key: string;
};

export type KeyRole = 'owner' | 'active' | 'posting';

export type BidInfo = {
  name: string;
  highBidder: string; // accountName
  highBid: number; // int
  lastBidTime: string; // Date
  glsName?: string; // TODO: lookup
};

export type AuctionInfo = {
  bids?: BidInfo[];
  lastClosedBid?: string; // Date
};

export type AuctionKind = 'account' | 'domain';

export type ProposalFinishType = {
  actor: string; //account name type
  status: 'exec' | 'cancel';
  execTrxId?: string;
};

export type BaseProposalType = {
  name: string; // name type
  blockNum: number;
  blockTime: string; // Date
  finished?: ProposalFinishType;
  updateTime?: string; //Date,
  expires?: string; //Date,
  scheduled?: string; // Date
};
