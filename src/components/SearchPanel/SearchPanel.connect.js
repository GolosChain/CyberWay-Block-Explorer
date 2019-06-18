import { connect } from 'react-redux';

import SearchPanel from './SearchPanel';
import Connection from '../../utils/Connection';

export default connect(
  null,
  {
    search: ({ text }) => async () => {
      const params = {
        text,
      };

      return await Connection.get().callApi('blocks.findEntity', params);
    },
  }
)(SearchPanel);
