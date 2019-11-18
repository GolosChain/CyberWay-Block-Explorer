import React, { PureComponent, cloneElement } from 'react';
import styled from 'styled-components';

const Wrap = styled.div``;

type Props = {
  active: boolean;
  transitionDuration: number;
  headOnClick: Function;
};

export default class AccordionItem extends PureComponent<Props> {
  static defaultProps = {
    active: false,
    transitionDuration: 400,
    headOnClick: alert,
  };

  render() {
    const { children, active, headOnClick, transitionDuration } = this.props;

    if (!children) {
      console.warn('AccordionItem must contain inner items!');
      return null;
    }
    return (
      <Wrap>
        {React.Children.map(children, child => {
          const item = child as React.ReactElement<any>;
          return cloneElement(item, { active, headOnClick, transitionDuration, ...item.props });
        })}
      </Wrap>
    );
  }
}
