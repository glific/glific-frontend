import React, { useState } from 'react';
import { InputBase, IconButton, InputAdornment } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import styles from './SearchBar.module.css';
import searchIcon from '../../../assets/images/icons/Search/Desktop.svg';
import { ReactComponent as AdvancedSearch } from '../../../assets/images/icons/AdvancedSearch.svg';

export interface SearchBarProps {
  handleChange?: (event: any) => void;
  handleSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  // This is for whether or not the parent gets re-rendered on search. To checkout comparison of
  // different functionalities, look at `ChatConversations` for without, and `TagList` with.
  searchVal?: string; // Calvin update-- all use-cases will use searchVal?
  className?: any;
  handleClick?: any;
  endAdornment?: any;
  searchMode: boolean;
}

export const SearchBar: React.SFC<SearchBarProps> = (props) => {
  const {
    searchMode,
    searchVal,
    onReset,
    endAdornment,
    handleClick,
    handleSubmit,
    handleChange,
    className,
  } = props;
  const [localSearchValue, setLocalSearchValue] = useState('');
  // use local state value so that we can set the defaults correctly
  // local value is needed for list component
  let inputValue: string = '';
  if (localSearchValue && searchMode) {
    inputValue = localSearchValue;
  } else if (searchVal) {
    inputValue = searchVal;
  }

  // display reset button only if value is entered
  let resetButton = null;
  if (inputValue) {
    resetButton = (
      <IconButton
        data-testid="resetButton"
        className={styles.ResetSearch}
        onClick={() => {
          setLocalSearchValue('');
          onReset();
        }}
      >
        <CloseIcon className={styles.CloseIcon} />
      </IconButton>
    );
  }

  let endAdornmentInput;
  if (endAdornment) {
    endAdornmentInput = (
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={(e: any) => {
            handleClick(e, 'search', 'update');
          }}
        >
          <AdvancedSearch />
        </IconButton>
      </InputAdornment>
    );
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="off" data-testid="searchForm">
      <div className={`${styles.SearchBar} ${className}`}>
        <div className={styles.IconAndText}>
          <img src={searchIcon} className={styles.SearchIcon} alt="Search" />
          <InputBase
            data-testid="searchInput"
            className={styles.SearchField}
            name="searchInput" // This is important for extracting the search value in parent component.
            placeholder="Search"
            onChange={(e: any) => {
              setLocalSearchValue(e.target.value);
              if (handleChange) {
                handleChange(e);
              }
            }}
            value={inputValue}
            endAdornment={endAdornmentInput}
          />
        </div>
        {resetButton}
      </div>
    </form>
  );
};

export default SearchBar;
