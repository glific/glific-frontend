import React, { useState } from 'react';
import { InputBase, IconButton, InputAdornment } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import styles from './SearchBar.module.css';
import searchIcon from '../../../assets/images/icons/Search/Desktop.svg';
import { ReactComponent as AdvancedSearch } from '../../../assets/images/icons/AdvancedSearch.svg';
import { DialogBox } from '../DialogBox/DialogBox';
import { Collection } from '../../../containers/Collection/Collection';

export interface SearchBarProps {
  handleChange?: (event: any) => void;
  handleSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  // This is for whether or not the parent gets re-rendered on search. To checkout comparison of
  // different functionalities, look at `ChatConversations` for without, and `TagList` with.
  searchVal?: string; // Calvin update-- all use-cases will use searchVal?
  className?: any;
}

export const SearchBar: React.SFC<SearchBarProps> = (props) => {
  const [localSearchValue, setLocalSearchValue] = useState('');
  const [dialog, setDialogbox] = useState(false);

  // use local state value so that we can set the defaults correctly
  let inputValue: string = '';
  if (localSearchValue) {
    inputValue = localSearchValue;
  } else {
    inputValue = props.searchVal || '';
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
          props.onReset();
        }}
      >
        <CloseIcon className={styles.CloseIcon}></CloseIcon>
      </IconButton>
    );
  }

  const handleClick = () => {
    setDialogbox(!dialog);
  };

  const closeDialogBox = () => {
    setDialogbox(false);
  };

  const handleSubmit = () => {
    console.log('Submit');
  };

  const search = (data: any) => {
    setLocalSearchValue(data.term);
    let target = { value: data.term, param: data };
    if (props.handleChange) {
      props.handleChange({ target });
    }
  };

  let dialogBox;
  if (dialog) {
    let match = { params: { id: null } };
    dialogBox = (
      <DialogBox title="" handleCancel={closeDialogBox} handleOk={handleSubmit} buttonOk="Search">
        <Collection match={match} type="search" search={search}></Collection>
      </DialogBox>
    );
  }

  return (
    <form onSubmit={props.handleSubmit} autoComplete="off" data-testid="searchForm">
      <div className={`${styles.SearchBar} ${props.className}`}>
        <div className={styles.IconAndText}>
          <img src={searchIcon} className={styles.SearchIcon} alt="Search" />
          <InputBase
            data-testid="searchInput"
            className={styles.SearchField}
            name="searchInput" // This is important for extracting the search value in parent component.
            placeholder="Search"
            onChange={(e: any) => {
              setLocalSearchValue(e.target.value);
              if (props.handleChange) {
                props.handleChange(e);
              }
            }}
            value={inputValue}
            endAdornment={
              <InputAdornment position="end">
                <IconButton aria-label="toggle password visibility" onClick={handleClick}>
                  <AdvancedSearch />
                </IconButton>
              </InputAdornment>
            }
          />
        </div>
        {resetButton}
      </div>
      {dialogBox}
    </form>
  );
};

export default SearchBar;
