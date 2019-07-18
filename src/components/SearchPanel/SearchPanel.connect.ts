import { connect } from 'react-redux';

import { SET_FILTERS } from '../../store/constants';
import { FiltersType } from '../../types';
import { CALL_API } from '../../store/middlewares/callApi';

import SearchPanel from './SearchPanel';

export default connect(
  null,
  {
    search: ({ text }: { text: string }) => {
      const params = {
        text,
      };

      return {
        type: CALL_API,
        method: 'blocks.findEntity',
        params,
        meta: { ...params },
      };
    },
    applyFilter: (filters: FiltersType) => ({
      type: SET_FILTERS,
      payload: filters,
    }),
  }
)(SearchPanel);
