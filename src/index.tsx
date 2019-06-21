import React from 'react';
import ReactDOM from 'react-dom';
// @ts-ignore
import ToastsManager from 'toasts-manager';

import 'normalize.css/normalize.css';
import './index.css';
import './json-theme.css';
import Connection from './utils/Connection';
import App from './components/App';

const connection = new Connection({
  url: `ws://${window.location.hostname}:8080`,
});

connection.connect().catch(err => {
  console.error(err);
  ToastsManager.error(`Connection failed: ${err.message}`);
});

ReactDOM.render(<App />, document.getElementById('root'));
