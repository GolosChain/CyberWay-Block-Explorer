import React, { PureComponent } from 'react';
import styled from 'styled-components';
import throttle from 'lodash.throttle';

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

export default class SearchPanel extends PureComponent {
  requestStartIndex = 0;
  requestCompleteIndex = 0;

  state = {
    searchText: '',
    isSuggestClosed: true,
  };

  componentWillUnmount() {
    this.searchLazy.cancel();
  }

  onSearchTextChange = e => {
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
    const { searchText } = this.state;

    const startIndex = ++this.requestStartIndex;

    const { type, data } = await this.props.search({
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

  onSearchSubmit = async e => {
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

    return (
      <SearchForm onSubmit={this.onSearchSubmit}>
        <SearchInput
          value={searchText}
          type="search"
          onFocus={this.onSearchTextFocus}
          onChange={this.onSearchTextChange}
        />
        {result && !isSuggestClosed ? (
          <SuggestPanel items={[result]} close={this.onSuggestClose} />
        ) : null}
        <Button>Find</Button>
      </SearchForm>
    );
  }
}
