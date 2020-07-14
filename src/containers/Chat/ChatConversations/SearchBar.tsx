import React, { useState } from 'react';
import { InputBase, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import styles from './SearchBar.module.css';
import searchIcon from '../../../assets/images/icons/Search/Desktop.svg';

export interface SearchBarProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  // handleChange?: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  // This is for whether or not the parent gets re-rendered on search. To checkout comparison of
  // different functionalities, look at `ChatConversations` for without, and `TagList` with.
  searchVal?: string; // Calvin update-- all use-cases will use searchVal?
}

export const SearchBar: React.SFC<SearchBarProps> = (props) => {
  const [localSearchVal, setLocalSearchVal] = useState('');
  return (
    <form onSubmit={props.handleSubmit}>
      <div className={styles.SearchBar}>
        <div className={styles.IconAndText}>
          <img src={searchIcon} className={styles.SearchIcon} alt="Search" />
          {props.searchVal ? (
            <InputBase
              className={styles.SearchField}
              name="searchInput" // This is important for extracting the search value in parent component.
              placeholder="Search"
              defaultValue={props.searchVal}
            />
          ) : (
            <InputBase
              className={styles.SearchField}
              name="searchInput" // This is important for extracting the search value in parent component.
              placeholder="Search"
              onChange={(e: any) => {
                setLocalSearchVal(e.target.value);
              }}
              value={localSearchVal}
            />
          )}
        </div>
        {props.searchVal || localSearchVal ? (
          <IconButton
            className={styles.ResetSearch}
            onClick={() => {
              setLocalSearchVal('');
              props.onReset();
            }}
          >
            <CloseIcon className={styles.CloseIcon}></CloseIcon>
          </IconButton>
        ) : null}
      </div>
    </form>
  );
};
