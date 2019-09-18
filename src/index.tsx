import React from 'react';
import ReactDOM from 'react-dom';
import ToastsManager from 'toasts-manager';

import 'normalize.css/normalize.css';
import './index.css';
import './json-theme.css';
import Connection from './utils/Connection';
import App from './components/App';

const connection = new Connection({
  url: getWebSocketUrl(),
});

function getWebSocketUrl() {
  const envUrl = process.env.REACT_APP_GATE_URL;

  if (envUrl) {
    return envUrl;
  }

  const { protocol, hostname } = window.location;

  if (protocol === 'https:') {
    return `wss://gate-${hostname}`;
  }

  return `ws://${hostname}:8080`;
}

connection.connect().catch(err => {
  console.error(err);
  ToastsManager.error(`Connection failed: ${err.message}`);
});

ReactDOM.render(<App />, document.getElementById('root'));
