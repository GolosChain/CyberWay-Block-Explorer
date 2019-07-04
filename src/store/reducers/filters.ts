import { Action, FiltersType } from '../../types';

import { SET_FILTERS, SET_STATUS_FILTER } from '../constants';

export type State = FiltersType;

const initialState: State = {};

export default function(state: State = initialState, { type, payload, meta }: Action) {
  switch (type) {
    case SET_FILTERS:
      return {
        ...state,
        code: payload.code,
        action: payload.action,
        actor: payload.actor,
        nonEmpty: payload.nonEmpty,
      };
    case SET_STATUS_FILTER:
      return {
        ...state,
        status: payload.status,
      };
    default:
      return state;
  }
}
