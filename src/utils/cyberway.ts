import { JsonRpc, Api } from 'cyberwayjs';
import { TextEncoder, TextDecoder } from 'text-encoding';
import JsSignatureProvider from 'cyberwayjs/dist/eosjs-jssig';

import { KeyAuthType, KeyRole } from '../types';

const HOST = process.env.GLS_NODE_HOST || 'https://node-cyberway.golos.io';

const rpc = new JsonRpc(HOST);

type getAccountResult = {
  permissions: [{ perm_name: KeyRole; required_auth: any }];
};

export async function getAccountPublicKey(accountId: string, keyRole = 'active') {
  let account: getAccountResult | null = null;
  let key;

  try {
    account = (await Promise.race([rpc.get_account(accountId), timeout(2000)])) as any;

    if (account) {
      const perm = account.permissions.find(({ perm_name }) => perm_name === keyRole);

      if (perm) {
        key = perm.required_auth.keys[0].key;
      }
    }
  } catch (err) {
    console.error(err);
  }

  return key || null;
}

function makeRecallVoteAction(grantor: string, recipient: string, pct: number) {
  return {
    account: 'cyber.stake',
    name: 'recallvote',
    authorization: [
      {
        actor: grantor,
        permission: 'active',
      },
    ],
    data: {
      grantor_name: grantor,
      recipient_name: recipient,
      token_code: 'CYBER',
      pct,
    },
  };
}

function makeSetGrantTermsAction(
  grantor: string,
  recipient: string,
  pct: number,
  maxFee: number,
  minStaked: number
) {
  return {
    account: 'cyber.stake',
    name: 'setgrntterms',
    authorization: [
      {
        actor: grantor,
        permission: 'active',
      },
    ],
    data: {
      grantor_name: grantor,
      recipient_name: recipient,
      token_code: 'CYBER',
      pct,
      break_fee: maxFee,
      break_min_own_staked: minStaked,
    },
  };
}

export function makeSetProxyLevelAction(account: string, level: number) {
  return {
    account: 'cyber.stake',
    name: 'setproxylvl',
    authorization: [
      {
        actor: account,
        permission: 'active',
      },
    ],
    data: {
      account,
      token_code: 'CYBER',
      level,
    },
  };
}

export async function pushTransaction({ auth, trx }: { auth: KeyAuthType; trx: any }) {
  return await pushTransactionUsingKeys({ keys: [auth.key], trx });
}

export async function pushTransactionUsingKeys({ keys, trx }: { keys: string[]; trx: any }) {
  const signatureProvider = new JsSignatureProvider(keys);

  const api = new Api({
    rpc,
    signatureProvider,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder(),
  });

  const result = await api.transact(trx, {
    blocksBehind: 5,
    expireSeconds: 3600,
  });

  console.log('Sent transaction:', result);
  return result;
}

export async function setProxyLevel({ auth, level }: { auth: KeyAuthType; level: number }) {
  if (Number.isInteger(level) && level >= 0 && level <= 4) {
    const actions = [makeSetProxyLevelAction(auth.accountId, level)];
    await pushTransaction({ auth, trx: { actions } });
  } else {
    throw new Error('Level must be integer between 0 and 4 inclusive');
  }
}

export async function recall({ auth, recipients }: { auth: KeyAuthType; recipients: string[] }) {
  const grantor = auth.accountId;
  const actions = [];

  for (const recipient of recipients) {
    actions.push(makeRecallVoteAction(grantor, recipient, 10000));
  }

  await pushTransaction({ auth, trx: { actions } });
}

export async function breakGrant({
  auth,
  recipients,
}: {
  auth: KeyAuthType;
  recipients: string[];
}) {
  const grantor = auth.accountId;
  const actions = [];

  for (const recipient of recipients) {
    actions.push(makeSetGrantTermsAction(grantor, recipient, 0, 10000, 0));
  }

  await pushTransaction({ auth, trx: { actions } });
}

function timeout(ms: number) {
  return new Promise((resolve, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
}

export function amountToCyber(x: number) {
  return `${(x / 10000).toFixed(4)} CYBER`;
}

export function formatCyber(amount: number, full?: boolean) {
  let x = amount / 10000;
  if (full) {
    return x.toLocaleString(undefined, { minimumFractionDigits: 4 }) + ' CYBER';
  }

  let idx = 0;
  let suffix = ['', 'k', 'M'];
  let precision = 4;
  let m = 1;

  while (idx < suffix.length && x >= 1000) {
    x /= 1000;
    idx++;
  }
  while (precision > 0 && x >= m && m <= 1000) {
    precision--;
    m *= 10;
  }

  return `${x.toFixed(precision)}${suffix[idx]} CYBER`;
}

export function formatPct(x: number) {
  return (x / 100).toFixed(2) + '%';
}
