import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import Connection from './utils/Connection';
import App from './components/App';
import ToastsManager from 'toasts-manager/src';

ReactDOM.render(<App />, document.getElementById('root'));

const connection = new Connection({
  url: 'ws://localhost:9595',
});

connection.connect().catch(err => {
  console.error(err);
  ToastsManager.error(`Connection failed: ${err.message}`);
});
