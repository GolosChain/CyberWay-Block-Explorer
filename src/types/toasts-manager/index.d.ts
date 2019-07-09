declare module 'toasts-manager' {
  import { PureComponent, Component } from 'react';

  export default class ToastsManager extends PureComponent {
    static log(string): void;
    static warn(string): void;
    static error(string): void;
  }

  export class Toast extends Component {}
}
