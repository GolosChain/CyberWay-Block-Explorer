import styled from 'styled-components';
import is from 'styled-is';

export default styled.span<{ bold?: boolean }>`
  font-family: monospace;

  ${is('bold')`
    font-weight: 600;
  `};
`;
