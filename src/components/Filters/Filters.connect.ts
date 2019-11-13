import { connect } from 'react-redux';

import { SET_FILTERS } from '../../store/constants';
import { FiltersType } from '../../types';

import Filters from './Filters';

export default connect(
  null,
  {
    applyFilter: (filters: FiltersType) => ({
      type: SET_FILTERS,
      payload: filters,
    }),
  }
)(Filters);
