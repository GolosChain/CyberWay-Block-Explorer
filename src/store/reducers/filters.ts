import { Action, FiltersType } from '../../types';

import { SET_FILTERS, SET_STATUS_FILTER, SET_TYPE_FILTER } from '../constants';

export type State = FiltersType;

const initialState: State = {};

export default function(state: State = initialState, { type, payload, meta }: Action): State {
  switch (type) {
    case SET_FILTERS:
      return {
        ...state,
        code: payload.code,
        action: payload.action,
        actor: payload.actor,
        event: payload.event,
        nonEmpty: payload.nonEmpty,
      };
    case SET_STATUS_FILTER:
      return {
        ...state,
        status: payload.status,
      };
    case SET_TYPE_FILTER:
      return {
        ...state,
        type: payload.type,
      };
    default:
      return state;
  }
}
