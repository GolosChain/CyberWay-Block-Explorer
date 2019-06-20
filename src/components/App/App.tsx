import React from 'react';
import { Provider } from 'react-redux';
// @ts-ignore
import ToastsManager from 'toasts-manager';
import styled, { createGlobalStyle } from 'styled-components';
import { BrowserRouter as Router } from 'react-router-dom';

import { getStore } from '../../store';
import Header from '../Header';
import Main from '../Main';
import Footer from '../Footer';

const GlobalStyles = createGlobalStyle`
  html, body, #root {
    height: 100%;
  }
  
  ul, ol {
    padding: 0;
    margin: 0;
  }
  
  li {
    list-style: none;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
  }
  
  pre {
    margin: 0;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
`;

export default function App() {
  return (
    <>
      <GlobalStyles />
      <Provider store={getStore()}>
        <Router>
          <Wrapper>
            <Header />
            <Main />
            <Footer />
            <ToastsManager />
          </Wrapper>
        </Router>
      </Provider>
    </>
  );
}
