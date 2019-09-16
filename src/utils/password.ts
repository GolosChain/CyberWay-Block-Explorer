// @ts-ignore
import ecc from 'eosjs-ecc';

import { KeyRole } from '../types';

type GetKeyParams = {
  accountId: string;
  userInput: string;
  publicKey: string | null;
  golosId?: string | null;
  keyRole?: KeyRole;
};

export function getKey({
  accountId,
  golosId,
  publicKey,
  userInput,
  keyRole = 'active',
}: GetKeyParams) {
  try {
    // If key could be converted into public key without error it means key is valid
    ecc.privateToPublic(userInput, 'GLS');
    return userInput;
  } catch {
    // If it's not a key try extract key from seed

    if (golosId && publicKey) {
      const key = ecc.seedPrivate(`${golosId}${keyRole}${userInput}`);

      if (ecc.privateToPublic(key, 'GLS') === publicKey) {
        return key;
      }
    }

    return ecc.seedPrivate(`${accountId}${keyRole}${userInput}`);
  }
}
