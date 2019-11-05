// TODO: move to some cyberway utils package to be reusable from backend

export function isNameValid(name: string) {
  return (
    name.match(/^[a-z1-5][.a-z1-5]{0,12}$/) &&
    !name.split('.').includes('') &&
    (name.length < 13 || name[12].match(/[1-5a-k]/))
  );
}

export function isAccountNameValid(name: string) {
  return name.length <= 12 && isNameValid(name);
}

export type ParsedName = {
  account?: string;
  domain?: string;
  username?: string;
  bad?: boolean;
};

// checks if empty strings have same indices in both arrays
function matchEmpty(a: string[], b: string[]) {
  return a.length === b.length && a.every((x, i) => !x === !b[i]);
}

export function parseName(name: string) {
  const templates = [
    ['account'],
    ['', 'domain'],
    ['username', 'domain'],
    ['username', '', 'account'],
  ];
  const parts = name.split('@');

  for (const fields of templates) {
    if (matchEmpty(parts, fields)) {
      const result: any = {};
      for (const [field, value] of fields.map((x, i) => [x, parts[i]])) {
        if (field) {
          result[field] = value;
        }
      }
      return result as ParsedName;
    }
  }
  return { bad: true };
}

// constants (see: https://github.com/cyberway/cyberway/blob/master/libraries/chain/include/cyberway/chain/domain_name.hpp)
const LIMITS = {
  domain: { maxSize: 253, minPartSize: 1, maxPartSize: 63 },
  username: { maxSize: 32, minPartSize: 1, maxPartSize: 32 },
};

// TODO: it's possible to return detailed validation error (which part is invalid)
function isDomainUsernameValid(name: string, key: 'domain' | 'username') {
  const limit = LIMITS[key];
  const labels = name.split('.');
  const m =
    name.length <= limit.maxSize &&
    labels.every(
      x =>
        x.length >= limit.minPartSize &&
        x.length <= limit.maxPartSize &&
        x.match(/^([a-z0-9]|[a-z0-9][-a-z0-9]*[a-z0-9])$/)
    ) &&
    (key !== 'domain' || !(labels.pop() || '').match(/^[0-9]+$/));
  return m;
}

function isDomainValid(domain: string) {
  return isDomainUsernameValid(domain, 'domain');
}

function isUsernameValid(name: string) {
  return isDomainUsernameValid(name, 'username');
}

export function validateParsedName(name: ParsedName) {
  const { bad, account, domain, username } = name;
  return bad
    ? "can't parse"
    : account && !isAccountNameValid(account)
    ? `invalid account name "${account}"`
    : domain && !isDomainValid(domain)
    ? `invalid domain "${domain}"`
    : username && !isUsernameValid(username)
    ? `invalid username "${username}"`
    : null;
}
