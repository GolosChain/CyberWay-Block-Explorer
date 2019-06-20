import React, { PureComponent } from 'react';
import styled from 'styled-components';
import throttle from 'lodash.throttle';

import { Suggest } from '../../types';
import SuggestPanel from '../SuggestPanel';

const SearchForm = styled.form`
  display: flex;
  position: relative;
  margin-left: 40px;
`;

const SearchInput = styled.input`
  width: 350px;
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

  onSearchTextChange = (e: any) => {
    const text = e.target.value;

    this.setState({
      searchText: text,
    });

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

  search = async () => {
    const { search } = this.props;

    const { searchText } = this.state;

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

  onSearchSubmit = async (e: any) => {
    e.preventDefault();
    this.search();
  };

  onSuggestClose = () => {
    this.setState({
      isSuggestClosed: true,
    });
  };

  render() {
    const { searchText, result, isSuggestClosed } = this.state;

    let panel = null;

    if (result && !isSuggestClosed) {
      panel = <SuggestPanel items={[result as any]} close={this.onSuggestClose} />;
    }

    return (
      <SearchForm onSubmit={this.onSearchSubmit}>
        <SearchInput
          value={searchText}
          type="search"
          onFocus={this.onSearchTextFocus}
          onChange={this.onSearchTextChange}
        />
        {panel}
        <Button>Find</Button>
      </SearchForm>
    );
  }
}
