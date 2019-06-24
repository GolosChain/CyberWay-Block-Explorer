import { Action, FiltersType } from '../../types';

import { SET_FILTERS } from '../constants';

export type State = FiltersType;

const initialState: State = {};

export default function(state: State = initialState, { type, payload, meta }: Action) {
  switch (type) {
    case SET_FILTERS:
      return {
        code: payload.code,
        action: payload.action,
      };
    default:
      return state;
  }
}
