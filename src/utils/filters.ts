import { FiltersType } from '../types';

export function getHash() {
  return decodeURI(window.location.hash.substr(1).replace(/\++/g, '%20'));
}

export function setHash(text: string): void {
  const newHash = '#' + encodeURI(text.replace(/\s+/, ' ')).replace(/%20/g, '+');

  if (window.location.hash.length > 1) {
    window.history.replaceState(null, '', newHash);
  } else {
    window.history.pushState(null, '', newHash);
  }
}

export function parseFilters(text: string): FiltersType {
  const filters: FiltersType = {};

  const matches = text.match(/\b(?:action|code)\s*:\s*[\w\d.]+\b/g);

  if (matches) {
    for (const subString of matches) {
      const pair = subString.match(/^(\w+)\s*:\s*([\w\d.]+)$/);

      if (!pair) {
        continue;
      }

      const [, type, value] = pair;

      if (type === 'action') {
        filters.action = value;
      } else if (type === 'code') {
        filters.code = value;
      }
    }
  }

  if (/\bnon?-?Empty\b/i.test(text)) {
    filters.nonEmpty = true;
  }

  return filters;
}
