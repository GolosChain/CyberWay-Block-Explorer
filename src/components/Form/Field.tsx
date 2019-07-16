import styled from 'styled-components';
import is from 'styled-is';

export default styled.label<{ line?: boolean }>`
  display: flex;
  flex-direction: column;
  margin: 6px 0;

  ${is('line')`
    display: block;
  `};
`;
