import React from 'react';
import ReactDOM from 'react-dom';
import ToastsManager from 'toasts-manager';

import 'normalize.css/normalize.css';
import './index.css';
import Connection from './utils/Connection';
import App from './components/App';

const connection = new Connection({
  url: 'ws://localhost:9595',
});

connection.connect().catch(err => {
  console.error(err);
  ToastsManager.error(`Connection failed: ${err.message}`);
});

ReactDOM.render(<App />, document.getElementById('root'));

// setTimeout(async () => {
//   const result = await connection.callApi('blocks.getBlockList');
//
//   console.log('getBlockList result', result);
// });
