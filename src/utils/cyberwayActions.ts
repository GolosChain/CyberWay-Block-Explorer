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
