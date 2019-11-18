import React, { PureComponent } from 'react';
import styled from 'styled-components';

const Body = styled.div`
  margin: 0 4px 4px;
`;

const Pad = styled.div`
  background: #eee;
  border: 1px solid #ddd;
  border-width: 0 1px 1px;
  border-radius: 0 0 2px 2px;
  padding: 12px 6px;
  box-sizing: border-box;
`;

type Props = {
  active?: boolean;
  transitionDuration?: number;
};

export default class Accordion extends PureComponent<Props> {
  ref: HTMLElement | null = null;

  getHeight() {
    return this.ref ? (this.ref.children[0] as HTMLElement).offsetHeight : 'auto';
  }

  transitionCss(prop: string, fn = 'ease') {
    return `${prop} ${this.props.transitionDuration}ms ${fn}`;
  }

  render() {
    const { children, active } = this.props;
    const style = {
      overflow: 'hidden',
      transition: this.transitionCss('height', 'ease-in-out'),
      height: active ? this.getHeight() : 0, // TODO: set this to 'auto' after expanding (and to px before collapsing) to prevent resizing problems
    };

    return (
      <Body ref={r => (this.ref = r)} style={style}>
        <Pad>
          {children}
        </Pad>
      </Body>
    );
  }
}
