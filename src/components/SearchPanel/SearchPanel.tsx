import React, { PureComponent, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import throttle from 'lodash.throttle';

import { Suggest } from '../../types';
import SuggestPanel from '../SuggestPanel';
import Filters from '../Filters';

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  height: 40px;
`;

const Hint = styled.span`
  margin-right: 10px;
  cursor: help;

  @media (max-width: 600px) {
    display: none;
  }
`;

const InputWrapper = styled.div`
  display: inline-block;
  position: relative;
`;

const SearchInput = styled.input`
  width: 500px;

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const Button = styled.button`
  margin-left: 6px;
`;

type Props = {
  search: Function;
};

type State = {
  searchText: string;
  isSuggestClosed: boolean;
  isShowFilters: boolean;
  items: Suggest[] | null;
};

export default class SearchPanel extends PureComponent<Props, State> {
  requestStartIndex = 0;
  requestCompleteIndex = 0;

  state = {
    searchText: '',
    isSuggestClosed: true,
    isShowFilters: false,
    items: null,
  };

  componentWillUnmount() {
    this.searchLazy.cancel();
  }

  onSearchTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;

    this.setState({
      searchText: text,
    });

    const query = text.trim();

    if (query.length >= 2) {
      this.searchLazy();
    } else {
      this.setState({
        items: null,
      });
      this.searchLazy.cancel();
    }
  };

  onSearchTextFocus = () => {
    this.setState({
      isSuggestClosed: false,
    });
  };

  search = async () => {
    const { search } = this.props;
    const { searchText } = this.state;

    const query = searchText.trim();

    if (query.length < 2) {
      return;
    }

    const startIndex = ++this.requestStartIndex;

    const { items } = await search({
      text: searchText.trim(),
    });

    // Отбрасываем результаты поиска если пришел уже более современный ответ
    if (startIndex < this.requestCompleteIndex) {
      return;
    }

    this.requestCompleteIndex = startIndex;

    this.setState({
      isSuggestClosed: false,
      items,
    });
  };

  searchLazy = throttle(this.search, 400, { leading: false, trailing: true });

  onSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    this.search();
  };

  onSuggestClose = () => {
    this.setState({
      isSuggestClosed: true,
    });
  };

  onShowFiltersClick = () => {
    this.setState({
      isShowFilters: true,
    });
  };

  render() {
    const { searchText, items, isSuggestClosed, isShowFilters } = this.state;

    const itemsSafe = items || [];

    return (
      <div>
        <SearchForm onSubmit={this.onSearchSubmit}>
          <Hint title={'Allowed query: block id, transaction id, account id (by prefix).'}>
            [?]
          </Hint>
          <InputWrapper>
            <SearchInput
              type="search"
              placeholder="Block id, transaction id, account id"
              value={searchText}
              onFocus={this.onSearchTextFocus}
              onChange={this.onSearchTextChange}
            />
            {!isSuggestClosed && items ? (
              <SuggestPanel items={itemsSafe} close={this.onSuggestClose} />
            ) : null}
          </InputWrapper>
          <Button>Find</Button>
          <Button title="Show filters" type="button" onClick={this.onShowFiltersClick}>
            ↩
          </Button>
        </SearchForm>
        <Filters isForceShow={isShowFilters} />
      </div>
    );
  }
}
