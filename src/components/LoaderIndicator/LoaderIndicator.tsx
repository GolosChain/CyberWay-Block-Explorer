import React, { PureComponent } from 'react';
import styled, { keyframes, css } from 'styled-components';

const SIZE = 36;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1
  }
`;

const Wrapper = styled.div`
  display: inline-block;
  width: ${SIZE}px;
  height: ${SIZE}px;
  overflow: hidden;
  pointer-events: none;
  animation: ${fadeIn} 0.3s;
`;

const rotate = keyframes`
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(1turn);
  }
`;

const Inner = styled.div<{ paused?: boolean }>`
  position: absolute;
  width: ${SIZE}px;
  height: ${SIZE}px;
  transform-origin: center;

  ${({ paused }) =>
    paused
      ? null
      : css`
          animation: ${rotate} 2s linear infinite;
        `}
`;

const Dot = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  margin: -2px;
  border-radius: 50%;
  background: #000;
`;

type Props = {
  paused?: boolean;
  className?: string;
};

export default class LoaderIndicator extends PureComponent<Props> {
  render() {
    const { paused, className } = this.props;

    return (
      <Wrapper className={className}>
        <Inner paused={paused}>
          <Dot style={{ transform: `translate(${SIZE / 2}px, 6px)` }} />
          <Dot style={{ transform: 'translate(7px, 25px)' }} />
          <Dot style={{ transform: `translate(${SIZE - 7}px, 25px)` }} />
        </Inner>
      </Wrapper>
    );
  }
}
