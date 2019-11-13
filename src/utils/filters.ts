import { FiltersType } from '../types';

export function extractFilterValuesFromHash(): FiltersType {
  try {
    const hash = decodeURI(window.location.hash.substr(1).replace(/\++/g, '%20'));

    if (!hash.trim()) {
      return {};
    }

    if (hash.includes('=')) {
      return parseFilters(hash);
    }

    return parseFiltersOldFormat(hash);
  } catch (err) {
    console.error('Hash parsing failed:', err);
    return {};
  }
}

function parseFilters(hash: string): FiltersType {
  const pairs = hash.split('&');

  const values: FiltersType = {
    code: undefined,
    action: undefined,
    actor: undefined,
    event: undefined,
    nonEmpty: undefined,
  };

  for (const pair of pairs) {
    const match = pair.trim().match(/^([^=]+)(?:=(.*)?)?$/);

    if (match) {
      const key = match[1];
      const value = match[2];

      switch (key) {
        case 'contract':
          values.code = value;
          break;
        case 'action':
          values.action = value;
          break;
        case 'actor':
          values.actor = value;
          break;
        case 'event':
          values.event = value;
          break;
        case 'noempty':
          values.nonEmpty = true;
          break;
        default:
        // Skip all other params
      }
    }
  }

  return values;
}

export function parseFiltersOldFormat(hash: string): FiltersType {
  const filters: FiltersType = {};

  const matches = hash.match(/\b(?:action|code|actor|event)\s*:\s*[\w\d\\.]+\b/g);

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
      } else if (type === 'actor') {
        filters.actor = value;
      } else if (type === 'event') {
        filters.event = value;
      }
    }
  }

  if (/\bnon?-?Empty\b/i.test(hash)) {
    filters.nonEmpty = true;
  }

  return filters;
}

export function setHash(values: FiltersType): void {
  const params = [];

  if (values.code) {
    params.push(`contract=${values.code}`);
  }

  if (values.action) {
    params.push(`action=${values.action}`);
  }

  if (values.actor) {
    params.push(`actor=${values.actor}`);
  }

  if (values.event) {
    params.push(`event=${values.event}`);
  }

  if (values.nonEmpty) {
    params.push('noempty');
  }

  const newHash = '#' + encodeURI(params.join('&').replace(/\s+/, ' ')).replace(/%20/g, '+');

  if (window.location.hash.length > 1) {
    window.history.replaceState(null, '', newHash);
  } else {
    window.history.pushState(null, '', newHash);
  }
}
