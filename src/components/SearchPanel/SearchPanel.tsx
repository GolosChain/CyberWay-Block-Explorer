import React, { PureComponent, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import throttle from 'lodash.throttle';

import { FiltersType, Suggest } from '../../types';
import SuggestPanel from '../SuggestPanel';

const SearchForm = styled.form`
  display: flex;
  position: relative;
  margin-left: 40px;
`;

const SearchInput = styled.input`
  width: 500px;
`;

const Button = styled.button`
  margin-left: 6px;
`;

type Props = {
  search: Function;
  applyFilter: Function;
};

type State = {
  searchText: string;
  isSuggestClosed: boolean;
  result: Suggest | null;
};

export default class SearchPanel extends PureComponent<Props, State> {
  requestStartIndex = 0;
  requestCompleteIndex = 0;

  state = {
    searchText: '',
    isSuggestClosed: true,
    result: null,
  };

  componentWillUnmount() {
    this.searchLazy.cancel();
  }

  onSearchTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;

    this.setState({
      searchText: text,
    });

    if (text.trim() === '') {
      this.applyFilters('');
    }

    if (text.length >= 2) {
      this.searchLazy();
    } else {
      this.setState({
        result: null,
      });
    }
  };

  onSearchTextFocus = () => {
    this.setState({
      isSuggestClosed: false,
    });
  };

  search = async (isSubmit?: boolean) => {
    const { search } = this.props;
    const { searchText } = this.state;

    if (isSubmit) {
      this.applyFilters(searchText);
    }

    const startIndex = ++this.requestStartIndex;

    const { type, data } = await search({
      text: searchText.trim(),
    });

    // Отбрасываем результаты поиска если пришел уже более современный ответ
    if (startIndex < this.requestCompleteIndex) {
      return;
    }

    this.requestCompleteIndex = startIndex;

    if (type) {
      this.setState({
        isSuggestClosed: false,
        result: {
          type,
          data,
        },
      });
    } else {
      this.setState({
        result: null,
      });
    }
  };

  searchLazy = throttle(this.search, 400, { leading: false, trailing: true });

  onSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.search(true);
  };

  onSuggestClose = () => {
    this.setState({
      isSuggestClosed: true,
    });
  };

  applyFilters(searchText: string) {
    const { applyFilter } = this.props;

    const filters: FiltersType = {};

    const matches = searchText.match(/\b(?:action|code)\s*:\s*[\w\d.]+\b/g);

    if (matches) {
      for (const subString of matches) {
        const pair = subString.match(/^(\w+)\s*:\s*([\w\d.]+)$/);

        if (!pair) {
          continue;
        }

        const [, type, value] = pair;

        if (type === 'action') {
          filters.action = value;
        } else if (type === 'code') {
          filters.code = value;
        }
      }
    }

    filters.nonEmpty = /\bnon?-?Empty\b/i.test(searchText);

    applyFilter(filters);
  }

  render() {
    const { searchText, result, isSuggestClosed } = this.state;

    const items: Suggest[] = [];

    if (result && !isSuggestClosed) {
      // @ts-ignore
      items.push(result);
    }

    return (
      <SearchForm onSubmit={this.onSearchSubmit}>
        <SearchInput
          type="search"
          placeholder={`Block id, trx id or filter like: "code: gls.publish action: reblog"`}
          value={searchText}
          onFocus={this.onSearchTextFocus}
          onChange={this.onSearchTextChange}
        />
        {items.length ? <SuggestPanel items={items} close={this.onSuggestClose} /> : null}
        <Button>Find</Button>
      </SearchForm>
    );
  }
}
