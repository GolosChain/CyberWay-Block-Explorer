import ecc from 'eosjs-ecc';

export function getKey({ accountId, golosId, userInput, keyRole = 'active' }) {
  try {
    // If key could be converted into public key it means key is valid
    ecc.privateToPublic(userInput, 'GLS');
    return userInput;
  } catch {
    // If it's not a key try extract key from seed
    return ecc.seedPrivate(`${golosId || accountId}${keyRole}${userInput}`);
  }
}
