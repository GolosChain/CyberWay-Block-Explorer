import React, { PureComponent, cloneElement } from 'react';
import styled from 'styled-components';

const Wrap = styled.div`
  max-width: 700px;
`;

type Props = {
  transitionDuration: number;
};

type State = {
  active: number;
};

export default class Accordion extends PureComponent<Props, State> {
  static defaultProps = {
    transitionDuration: 400,
  };

  state = {
    active: -1,
  };

  toggle(idx: number) {
    const same = idx === this.state.active;
    this.setState({ active: same ? -1 : idx });
  }

  render() {
    const { children, transitionDuration } = this.props;
    const { active } = this.state;

    return (
      <Wrap>
        {React.Children.map(children, (item, i) =>
          cloneElement(item as React.ReactElement<any>, {
            key: i,
            active: i === active,
            transitionDuration,
            headOnClick: () => this.toggle(i),
          })
        )}
      </Wrap>
    );
  }
}
