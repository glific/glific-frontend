import { useState } from 'react';
import { InputBase, IconButton, InputAdornment } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

import searchIcon from 'assets/images/icons/Search/Desktop.svg';
import search from 'assets/images/icons/Search/Search.svg';
import { ReactComponent as AdvancedSearch } from 'assets/images/icons/AdvancedSearch.svg';
import styles from './SearchBar.module.css';
import Track from 'services/TrackService';

export interface SearchBarProps {
  handleChange?: (e: any) => void;
  handleSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  searchVal?: string;
  className?: any;
  handleClick?: any;
  endAdornment?: any;
  searchMode: boolean;
}

export const SearchBar = ({
  searchMode,
  searchVal = '',
  onReset,
  endAdornment,
  handleClick,
  handleSubmit,
  handleChange,
  className,
}: SearchBarProps) => {
  const [localSearchValue, setLocalSearchValue] = useState(searchVal);
  const { t } = useTranslation();

  // use local state value so that we can set the defaults correctly
  // local value is needed for list component
  let inputValue: any = '';
  if (searchMode) {
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
          disableFocusRipple
          aria-label="toggle password visibility"
          onClick={(e: any) => {
            Track('Advanced search');
            handleClick(e, 'search', 'update');
          }}
          className={styles.FilterIcon}
        >
          <AdvancedSearch data-testid="advanced-search-icon" />
        </IconButton>
      </InputAdornment>
    );
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="off" data-testid="searchForm">
      <div className={`${styles.SearchBar} ${className}`}>
        <div className={styles.IconAndText}>
          {endAdornment && <img src={search} className={styles.SearchIconFilter} alt="Search" />}
          <InputBase
            data-testid="searchInput"
            className={styles.SearchField}
            name="searchInput" // This is important for extracting the search value in parent component.
            placeholder={t('Search')}
            onChange={(e: any) => {
              setLocalSearchValue(e.target.value);
              if (handleChange) {
                handleChange(e);
              }
            }}
            value={inputValue}
            endAdornment={endAdornmentInput}
          />
          {!endAdornment && <img src={searchIcon} className={styles.SearchIcon} alt="Search" />}
        </div>
        {resetButton}
      </div>
    </form>
  );
};

export default SearchBar;
