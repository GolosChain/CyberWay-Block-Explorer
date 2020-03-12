import { AuthType } from '../types';

// constructs actions
const SYS_TOKEN = 'CYBER';

function actionBase(account: string, name: string, actor: string, permission = 'active') {
  return { account, name, authorization: [{ actor, permission }] };
}

// cyber

function biosAction(action: string, actor: string, permission = 'active') {
  return actionBase('cyber', action, actor, permission);
}

export function checkWin(actor: string, permission = 'active') {
  return {
    ...biosAction('checkwin', actor, permission),
    data: {},
  };
}

export function bidName(bidder: string, newname: string, bid: string) {
  return {
    ...biosAction('bidname', bidder),
    data: { bidder, newname, bid },
  };
}

// cyber.domain

function domainAction(action: string, actor: string, permission = 'active') {
  return actionBase('cyber.domain', action, actor, permission);
}

export function domainCheckWin(actor: string, permission = 'active') {
  return {
    ...domainAction('checkwin', actor, permission),
    data: {},
  };
}

export function domainBid(bidder: string, name: string, bid: string) {
  return {
    ...domainAction('biddomain', bidder),
    data: { bidder, name, bid },
  };
}

// cyber.stake

function stakeAction(action: string, actor: string) {
  return actionBase('cyber.stake', action, actor);
}

export function recallVoteAction(grantor: string, recipient: string, pct = 10000) {
  return {
    ...stakeAction('recallvote', grantor),
    data: {
      grantor_name: grantor,
      recipient_name: recipient,
      token_code: SYS_TOKEN,
      pct,
    },
  };
}

export function setGrantTermsAction(
  grantor: string,
  recipient: string,
  pct = 0,
  maxFee = 10000,
  minStaked = 0
) {
  return {
    ...stakeAction('setgrntterms', grantor),
    data: {
      grantor_name: grantor,
      recipient_name: recipient,
      token_code: SYS_TOKEN,
      pct,
      break_fee: maxFee,
      break_min_own_staked: minStaked,
    },
  };
}

export function setProxyLevelAction(account: string, level: number) {
  return {
    ...stakeAction('setproxylvl', account),
    data: {
      account,
      token_code: SYS_TOKEN,
      level,
    },
  };
}

// cyber.msig

function msigAction(action: string, actor: string, permission = 'active') {
  return actionBase('cyber.msig', action, actor, permission);
}

export function maigPropose(proposer: string, proposal: string, requested: AuthType[], trx: any) {
  return {
    ...msigAction('propose', proposer),
    data: {
      proposer,
      proposal_name: proposal,
      requested,
      trx,
    },
  };
}

export function msigApprove(proposer: string, proposal: string, level: AuthType, hash?: string) {
  return {
    ...msigAction('approve', level.actor, level.permission),
    data: {
      proposer,
      proposal_name: proposal,
      level,
      proposal_hash: hash,
    },
  };
}

export function msigUnapprove(proposer: string, proposal: string, level: AuthType) {
  return {
    ...msigAction('unapprove', level.actor, level.permission),
    data: {
      proposer,
      proposal_name: proposal,
      level,
    },
  };
}

export function msigCancel(proposer: string, proposal: string, canceler = proposer) {
  return {
    ...msigAction('cancel', canceler),
    data: {
      proposer,
      proposal_name: proposal,
      canceler,
    },
  };
}

export function msigExec(proposer: string, proposal: string, executer = proposer) {
  return {
    ...msigAction('exec', executer),
    data: {
      proposer,
      proposal_name: proposal,
      executer,
    },
  };
}

export function msigSchedule(proposer: string, proposal: string, actor = proposer) {
  return {
    ...msigAction('schedule', actor),
    data: {
      proposer,
      proposal_name: proposal,
      actor,
    },
  };
}
