import React, { PureComponent } from 'react';
import styled, { keyframes } from 'styled-components';

const SIZE = 36;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(1turn);
  }
`;

const pulse = keyframes`
  from {
    transform: scale(1);
  }
  80% {
    transform: scale(1);
  }
  to {
    transform: scale(0.8);
  }
`;

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
  width: ${SIZE}px;
  height: ${SIZE}px;
  overflow: hidden;
  pointer-events: none;
  animation: ${fadeIn} 0.3s;
`;

const PulseGroup = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  animation: ${pulse} alternate 1.5s infinite;
`;

const RotationGroup = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform-origin: center;
  animation: ${rotate} 2s linear infinite;
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
  className?: string;
};

export default class LoaderIndicator extends PureComponent<Props> {
  render() {
    const { className } = this.props;

    return (
      <Wrapper className={className}>
        <PulseGroup>
          <RotationGroup>
            <Dot style={{ transform: `translate(${SIZE / 2}px, 6px)` }} />
            <Dot style={{ transform: 'translate(7px, 25px)' }} />
            <Dot style={{ transform: `translate(${SIZE - 7}px, 25px)` }} />
          </RotationGroup>
        </PulseGroup>
      </Wrapper>
    );
  }
}
