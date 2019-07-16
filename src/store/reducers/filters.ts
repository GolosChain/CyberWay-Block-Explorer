import { Action, FiltersType } from '../../types';

import { SET_FILTERS } from '../constants';

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
    default:
      return state;
  }
}
