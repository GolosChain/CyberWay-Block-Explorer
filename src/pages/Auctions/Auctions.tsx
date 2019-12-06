import React, { PureComponent } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import styled from 'styled-components';
import Tabs from '../../components/Tabs';
import Auction from '../../components/Auction';

const Wrapper = styled.div`
  margin: 16px;
`;

export type Props = RouteComponentProps & {};

export default class Auctions extends PureComponent<Props> {
  render() {
    const { history } = this.props;

    return (
      <Wrapper>
        <Tabs active={0}>
          Account names auction
          <Auction type="account" history={history} />
          Domains auction
          <Auction type="domain" history={history} />
        </Tabs>
      </Wrapper>
    );
  }
}
