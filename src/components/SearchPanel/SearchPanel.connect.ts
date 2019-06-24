import { connect } from 'react-redux';

import { SET_FILTERS } from '../../store/constants';
import { FiltersType } from '../../types';
import Connection from '../../utils/Connection';

import SearchPanel from './SearchPanel';

export default connect(
  null,
  {
    search: ({ text }: { text: string }) => async () => {
      const params = {
        text,
      };

      return await Connection.get().callApi('blocks.findEntity', params);
    },
    applyFilter: ({ code, action }: FiltersType) => ({
      type: SET_FILTERS,
      payload: {
        code,
        action,
      },
    }),
  }
)(SearchPanel);
