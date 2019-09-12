import ecc from 'eosjs-ecc';

export function getKey(accountId, privateKey, keyRole = 'active') {
  try {
    // If key could be converted into public key it means key is valid
    ecc.privateToPublic(privateKey, 'GLS');
    return privateKey;
  } catch {
    // If it's not a key try extract key from seed
    return passwordToKey(accountId, privateKey, keyRole);
  }
}

function passwordToKey(accountId, password, keyRole) {
  const privateKey = ecc.seedPrivate(`${accountId}${keyRole}${password}`);
  ecc.privateToPublic(privateKey, 'GLS');
  return privateKey;
}
