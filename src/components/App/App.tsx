import React from 'react';
import { Provider } from 'react-redux';
import Helmet from 'react-helmet';
import ToastsManager from 'toasts-manager';
import styled from 'styled-components';
import { BrowserRouter as Router } from 'react-router-dom';

import { getStore } from '../../store';
import Header from '../Header';
import Main from '../Main';
import Footer from '../Footer';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

const TITLE = 'CyberWay Block Explorer';

export default function App() {
  return (
    <Provider store={getStore()}>
      <Helmet defaultTitle={TITLE} titleTemplate={`%s — ${TITLE}`} />
      <Router>
        <Wrapper>
          <Header />
          <Main />
          <Footer />
          <ToastsManager />
        </Wrapper>
      </Router>
    </Provider>
  );
}
