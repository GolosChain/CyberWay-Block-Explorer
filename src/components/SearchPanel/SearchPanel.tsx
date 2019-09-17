import React, { PureComponent, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import throttle from 'lodash.throttle';

import { Suggest } from '../../types';
import SuggestPanel from '../SuggestPanel';
import { getHash, parseFilters, setHash } from '../../utils/filters';

const SearchForm = styled.form`
  display: flex;
  align-items: center;
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
  applyFilter: Function;
};

type State = {
  searchText: string;
  isSuggestClosed: boolean;
  items: Suggest[] | null;
};

export default class SearchPanel extends PureComponent<Props, State> {
  requestStartIndex = 0;
  requestCompleteIndex = 0;

  state = {
    searchText: getHash(),
    isSuggestClosed: true,
    items: null,
  };

  componentDidMount() {
    window.addEventListener('hashchange', this.onHashChange);
  }

  componentWillUnmount() {
    this.searchLazy.cancel();
    window.removeEventListener('hashchange', this.onHashChange);
  }

  onSearchTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.changeSearchText(e.target.value);
  };

  changeSearchText = (
    text: string,
    { isSubmit, dontUpdateHash }: { isSubmit?: boolean; dontUpdateHash?: boolean } = {}
  ) => {
    this.setState({
      searchText: text,
    });

    const query = text.trim();

    if (query === '') {
      this.applyFilters('');
    }

    if (query.length >= 2) {
      if (isSubmit) {
        this.search({ isSubmit: true, dontUpdateHash });
      } else {
        this.searchLazy({ dontUpdateHash });
      }
    } else {
      if (!dontUpdateHash) {
        setHash(text);
      }

      this.setState({
        items: null,
      });
      this.searchLazy.cancel();
    }
  };

  onHashChange = () => {
    this.changeSearchText(getHash(), {
      dontUpdateHash: true,
    });
  };

  onSearchTextFocus = () => {
    this.setState({
      isSuggestClosed: false,
    });
  };

  search = async ({
    isSubmit,
    dontUpdateHash,
  }: { isSubmit?: boolean; dontUpdateHash?: boolean } = {}) => {
    const { search } = this.props;
    const { searchText } = this.state;

    if (!dontUpdateHash) {
      setHash(searchText);
    }

    const query = searchText.trim();

    if (isSubmit) {
      this.applyFilters(searchText);
    }

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

  onSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.search({ isSubmit: true });
  };

  onSuggestClose = () => {
    this.setState({
      isSuggestClosed: true,
    });
  };

  applyFilters(searchText: string) {
    const { applyFilter } = this.props;

    applyFilter(parseFilters(searchText));
  }

  render() {
    const { searchText, items, isSuggestClosed } = this.state;

    const itemsSafe = items || [];

    return (
      <SearchForm onSubmit={this.onSearchSubmit}>
        <Hint
          title={
            'Allowed query: block id, transaction id, account id (by prefix). Allowed filters: code, action, actor, event, nonempty, example: "code: gls.publish action: upvote", "actor: gls", "event: postreward" or simple "nonempty", also allowed combination of any filters'
          }
        >
          [?]
        </Hint>
        <InputWrapper>
          <SearchInput
            type="search"
            placeholder="Block id, transaction id, account id or filters (see hint)"
            value={searchText}
            onFocus={this.onSearchTextFocus}
            onChange={this.onSearchTextChange}
          />
          {!isSuggestClosed && items ? (
            <SuggestPanel items={itemsSafe} close={this.onSuggestClose} />
          ) : null}
        </InputWrapper>
        <Button>Find</Button>
      </SearchForm>
    );
  }
}
