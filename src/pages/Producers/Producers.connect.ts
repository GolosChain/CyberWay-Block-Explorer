import { connect } from 'react-redux';

import { CALL_API } from '../../store/middlewares/callApi';

import Producers from './Producers';

export type LoadProducersParams = {};

export default connect(
  null,
  {
    loadProducers: (params: LoadProducersParams) => ({
      type: CALL_API,
      method: 'chain.getProducers',
      params,
      meta: { ...params },
    }),
  }
)(Producers);
