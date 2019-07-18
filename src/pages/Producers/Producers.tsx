import React, { PureComponent } from 'react';
import styled from 'styled-components';
import ToastsManager from 'toasts-manager';

import { ProducerType } from '../../types';
import { LoadProducersParams } from './Producers.connect';

import Link from '../../components/Link';

const Wrapper = styled.div`
  margin: 16px;
`;

const Title = styled.h1`
  margin: 12px 0;
`;

const UpdateTime = styled.div`
  margin: 0 0 16px;
`;

const List = styled.ul`
  margin-bottom: 40px;
`;

const AccountItem = styled.li`
  margin: 4px 0;
`;

export type Props = {
  loadProducers: (params: LoadProducersParams) => any;
};

export type State = {
  producers: ProducerType[] | null;
  updateTime: Date | null;
};

export default class Producers extends PureComponent<Props, State> {
  state = {
    producers: null,
    updateTime: null,
  };

  componentDidMount() {
    this.loadProducers();
  }

  async loadProducers() {
    const { loadProducers } = this.props;

    try {
      const { items, updateTime } = await loadProducers({});

      this.setState({
        producers: items,
        updateTime,
      });
    } catch (err) {
      ToastsManager.error(`Producers loading failed: ${err.message}`);
    }
  }

  renderLine({ id, signKey }: ProducerType) {
    return (
      <AccountItem key={id}>
        <Link to={`/account/${id}`}>{id}</Link> (signing key: {signKey})
      </AccountItem>
    );
  }

  render() {
    const { producers, updateTime } = this.state;

    return (
      <Wrapper>
        <Title>Block producers:</Title>
        {producers ? (
          <>
            {updateTime ? (
              <UpdateTime>
                Last updated at {new Date(updateTime as any).toLocaleString()}
              </UpdateTime>
            ) : null}
            <List>{(producers as any).map((item: ProducerType) => this.renderLine(item))}</List>
          </>
        ) : (
          'Loading ...'
        )}
      </Wrapper>
    );
  }
}
