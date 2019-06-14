import React from 'react';
import { Provider } from 'react-redux';
import ToastsManager from 'toasts-manager';
import styled, { createGlobalStyle } from 'styled-components';

import { getStore } from '../../store';
import Header from '../Header';
import Main from '../Main';
import Footer from '../Footer';

const GlobalStyles = createGlobalStyle`
  html, body, #root {
    height: 100%;
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
        <Wrapper>
          <Header />
          <Main />
          <Footer />
          <ToastsManager />
        </Wrapper>
      </Provider>
    </>
  );
}
