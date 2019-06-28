import { connect } from 'react-redux';

import Connection from '../../utils/Connection';

import Chart from './Chart';

export default connect(
  null,
  {
    loadData: ({ method }: { method: string }) => async () => {
      return await Connection.get().callApi(method, {});
    },
  }
)(Chart);
