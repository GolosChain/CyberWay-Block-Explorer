import { AuthType } from '../types';

// constructs actions
const SYS_TOKEN = 'CYBER';

function actionBase(account: string, name: string, actor: string) {
  return { account, name, authorization: [{ actor, permission: 'active' }] };
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

function msigAction(action: string, actor: string) {
  return actionBase('cyber.msig', action, actor);
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
    ...msigAction('approve', level.actor),
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
    ...msigAction('unapprove', level.actor),
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
