import { connect } from 'react-redux';
import { State } from '../../store';
import Contract from './Contract';
import { BaseAccountRouteParams } from '../../routes/Routes';

type Props = {
  match: {
    params: BaseAccountRouteParams;
  };
};

export default connect((state: State, props: Props) => {
  const { account } = props.match.params;

  return { account };
})(Contract);
