import { connect } from 'react-redux';

import { CALL_API } from '../../store/middlewares/callApi';
import Validators from './Validators';

export type LoadValidatorsParams = {};

export default connect(
  null,
  {
    loadValidators: (params: LoadValidatorsParams) => ({
      type: CALL_API,
      method: 'chain.getValidators',
      params,
      meta: { ...params },
    }),
  }
)(Validators);
