import React, { useState } from 'react';
import { InputBase, Divider, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import styles from './SearchBar.module.css';

export interface SearchBarProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  // This is for whether or not the parent gets re-rendered on search. To checkout comparison of
  // different functionalities, look at `ChatConversations` for without, and `TagList` with.
  searchVal?: string;
}

export const SearchBar: React.SFC<SearchBarProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSearchVal, setLocalSearchVal] = useState('');

  return (
    <>
      <IconButton className={styles.IconButton} onClick={() => setIsOpen(!isOpen)}>
        <SearchIcon className={styles.SearchIcon}></SearchIcon>
      </IconButton>
      <form onSubmit={props.handleSubmit}>
        <div className={isOpen ? styles.SearchBar : styles.HideSearchBar}>
          {props.searchVal ? (
            <InputBase
              className={isOpen ? styles.ShowSearch : styles.HideSearch}
              name="searchInput" // This is important for extracting the search value in parent component.
              defaultValue={props.searchVal}
            />
          ) : (
            <InputBase
              className={isOpen ? styles.ShowSearch : styles.HideSearch}
              name="searchInput" // This is important for extracting the search value in parent component.
              onChange={(e) => setLocalSearchVal(e.target.value)}
              value={localSearchVal}
            />
          )}
          {isOpen ? (
            <div
              className={styles.ResetSearch}
              onClick={() => {
                setLocalSearchVal('');
                props.onReset();
              }}
            >
              <Divider orientation="vertical" />
              <CloseIcon className={styles.CloseIcon}></CloseIcon>
            </div>
          ) : null}
        </div>
      </form>
    </>
  );
};
