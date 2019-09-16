import { JsonRpc, Api } from 'cyberwayjs';
import { TextEncoder, TextDecoder } from 'text-encoding';
import JsSignatureProvider from 'cyberwayjs/dist/eosjs-jssig';

import { AuthType, KeyRole } from '../types';

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

export async function recall({ auth, recipientId }: { auth: AuthType; recipientId: string }) {
  const signatureProvider = new JsSignatureProvider([auth.key]);

  const api = new Api({
    rpc,
    signatureProvider,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder(),
  });

  const transaction = {
    actions: [
      {
        account: 'cyber.stake',
        name: 'recallvote',
        authorization: [
          {
            actor: auth.accountId,
            permission: 'active',
          },
        ],
        data: {
          grantor_name: auth.accountId,
          recipient_name: recipientId,
          token_code: 'CYBER',
          pct: 10000,
        },
      },
    ],
  };

  const trx = await api.transact(transaction, {
    blocksBehind: 5,
    expireSeconds: 3600,
  });

  console.log('Sent transaction:', trx);
}

function timeout(ms: number) {
  return new Promise((resolve, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
}
