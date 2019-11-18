import React, { PureComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import { COLORS } from '../../utils/theme';

const Head = styled.div<{ active?: boolean }>`
  cursor: pointer;
  display: block;
  padding: 6px;
  background: #f8f8f8;
  border-radius: 2px;
  color: #444;
  font-size: 13px;

  ${is('active')`
    background: ${COLORS.blue};
    color: ${COLORS.blue};
  `};
`;

type Props = {
  active?: boolean;
  transitionDuration?: number;
  headOnClick?: Function;
};

export default class Accordion extends PureComponent<Props> {
  transitionCss(prop: string, fn = 'ease') {
    return `${prop} ${this.props.transitionDuration}ms ${fn}`;
  }

  render() {
    const { children, active, headOnClick } = this.props;
    const style = {
      transition: [this.transitionCss('background-color'), this.transitionCss('color')].join(','),
    };
    return (
      <Head active={active} onClick={() => headOnClick!()} style={style}>
        {children}
      </Head>
    );
  }
}
