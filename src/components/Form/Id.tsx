import styled from 'styled-components';
// @ts-ignore
import is from 'styled-is';

const Id: any = styled.span`
  font-family: monospace;

  ${is('bold')`
    font-weight: 600;
  `}
`;

export default Id;
