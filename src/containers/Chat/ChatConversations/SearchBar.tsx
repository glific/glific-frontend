import React, { useState } from 'react';
import { InputBase, Divider, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import styles from './SearchBar.module.css';

// /* <SearchBar handleSubmit={handleSearch} isOpen={searchOpen} onReset={resetSearch} defaultVal={searchVal}/> */
export interface SearchBarProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  searchVal: string;
  onReset: () => void;
}

export const SearchBar: React.SFC<SearchBarProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <IconButton className={styles.IconButton} onClick={() => setIsOpen(!isOpen)}>
        <SearchIcon className={styles.SearchIcon}></SearchIcon>
      </IconButton>
      <form onSubmit={props.handleSubmit}>
        <div className={isOpen ? styles.SearchBar : styles.HideSearchBar}>
          <InputBase
            defaultValue={props.searchVal}
            className={isOpen ? styles.ShowSearch : styles.HideSearch}
            name="searchInput"
          />
          {isOpen ? (
            <div className={styles.ResetSearch} onClick={props.onReset}>
              <Divider orientation="vertical" />
              <CloseIcon className={styles.CloseIcon}></CloseIcon>
            </div>
          ) : null}
        </div>
      </form>
    </>
  );
};
