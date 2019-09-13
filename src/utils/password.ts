// @ts-ignore
import ecc from 'eosjs-ecc';
import { AccountType } from '../types';

type GetKeyParams = {
  accountId: string;
  userInput: string;
  account?: AccountType | null;
  keyRole?: 'active' | 'owner' | 'posting';
};

export function getKey({ accountId, account, userInput, keyRole = 'active' }: GetKeyParams) {
  // const needPublicKey = account && account.keys ? account.keys[keyRole] : null;

  try {
    // If key could be converted into public key it means key is valid
    ecc.privateToPublic(userInput, 'GLS');
    return userInput;
  } catch {
    // If it's not a key try extract key from seed

    if (account && account.golosId) {
      return ecc.seedPrivate(`${account.golosId}${keyRole}${userInput}`);
    }

    return ecc.seedPrivate(`${accountId}${keyRole}${userInput}`);
  }
}
