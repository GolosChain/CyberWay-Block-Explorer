import React, { PureComponent, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';

import { FiltersType } from '../../types';
import { setHash, extractFilterValuesFromHash } from '../../utils/filters';

const Wrapper = styled.form<{ isShow: boolean }>`
  height: 0;
  overflow: hidden;
  transition: height 0.15s;

  ${is('isShow')`
    height: 100px;
    padding-bottom: 8px;

    @media (min-width: 600px) {
      height: 58px;
    }
  `};
`;

const Line = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  &:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const Field = styled.label`
  cursor: pointer;

  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const FieldTitle = styled.span`
  margin-right: 8px;
  font-size: 12px;
  color: #777;
  user-select: none;
`;

const FieldValue = styled.input`
  width: 140px;
`;

const HiddenSubmitButton = styled.button`
  display: none;
`;

const Buttons = styled.div`
  & > :not(:last-child) {
    margin-right: 6px;
  }
`;

const Button = styled.button``;

type Props = {
  isForceShow: boolean;
  isForceHide: boolean;
  applyFilter: Function;
};

type State = {
  contractText: string;
  actionText: string;
  actorText: string;
  eventText: string;
  nonEmpty: boolean;
  isShow: boolean;
};

export default class Filters extends PureComponent<Props, State> {
  static getStateFromFilters(values: FiltersType) {
    const { code, action, actor, event, nonEmpty } = values;

    return {
      contractText: code || '',
      actionText: action || '',
      actorText: actor || '',
      eventText: event || '',
      nonEmpty: Boolean(nonEmpty),
    };
  }

  static hasChanges(values: any) {
    for (const key of Object.keys(values)) {
      const value = values[key];

      if (value !== '' && value !== false) {
        return true;
      }
    }

    return false;
  }

  constructor(props: Props) {
    super(props);

    const stateValues = Filters.getStateFromFilters(extractFilterValuesFromHash());

    this.state = {
      ...stateValues,
      isShow: Filters.hasChanges(stateValues),
    };
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.onHashChange);
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.onHashChange);
  }

  onHashChange = () => {
    const { applyFilter } = this.props;

    const values = extractFilterValuesFromHash();

    const updatedState = Filters.getStateFromFilters(values);

    this.setState({
      ...updatedState,
      isShow: true,
    });

    applyFilter(values);
  };

  onContractChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      contractText: e.target.value,
    });
  };

  onActionChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      actionText: e.target.value,
    });
  };

  onActorChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      actorText: e.target.value,
    });
  };

  onEventChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      eventText: e.target.value,
    });
  };

  onNonEmptyChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState(
      {
        nonEmpty: e.target.checked,
      },
      () => {
        this.onFiltersSubmit();
      }
    );
  };

  onFiltersSubmit = (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const { applyFilter } = this.props;
    const { contractText, actionText, actorText, eventText, nonEmpty } = this.state;

    const values: FiltersType = {
      code: contractText.trim() || undefined,
      action: actionText.trim() || undefined,
      actor: actorText.trim() || undefined,
      event: eventText.trim() || undefined,
      nonEmpty: nonEmpty || undefined,
    };

    applyFilter(values);

    setTimeout(() => {
      setHash(values);
    }, 0);
  };

  onClearClick = () => {
    const { applyFilter } = this.props;

    this.setState(
      {
        ...Filters.getStateFromFilters({}),
        isShow: true,
      },
      () => {
        applyFilter({});

        setTimeout(() => {
          setHash({});
        }, 0);
      }
    );
  };

  render() {
    const { isForceShow, isForceHide } = this.props;
    const { contractText, actionText, actorText, eventText, nonEmpty, isShow } = this.state;

    return (
      <Wrapper isShow={(isForceShow || isShow) && !isForceHide} onSubmit={this.onFiltersSubmit}>
        <Line>
          <Field>
            <FieldTitle>Contract:</FieldTitle>
            <FieldValue value={contractText} onChange={this.onContractChange} />
          </Field>
          <Field>
            <FieldTitle>Action:</FieldTitle>
            <FieldValue name="action" value={actionText} onChange={this.onActionChange} />
          </Field>
          <Field>
            <FieldTitle>Actor:</FieldTitle>
            <FieldValue name="actor" value={actorText} onChange={this.onActorChange} />
          </Field>
        </Line>
        <Line>
          <Field>
            <FieldTitle>Event:</FieldTitle>
            <FieldValue name="event" value={eventText} onChange={this.onEventChange} />
          </Field>
          <Field>
            <input
              name="noempty"
              type="checkbox"
              checked={nonEmpty}
              onChange={this.onNonEmptyChange}
            />{' '}
            <FieldTitle>Non Empty</FieldTitle>
          </Field>
          <Buttons>
            <Button>Submit</Button>
            <Button type="button" onClick={this.onClearClick}>
              Clear
            </Button>
          </Buttons>
        </Line>
        {/* Button must be in form for submitting by Enter key */}
        <HiddenSubmitButton />
      </Wrapper>
    );
  }
}
