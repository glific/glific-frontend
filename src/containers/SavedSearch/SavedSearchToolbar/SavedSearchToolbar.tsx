import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { IconButton, Popper, Fade, Paper, ClickAwayListener } from '@material-ui/core';

import { ReactComponent as OptionsIcon } from 'assets/images/icons/MoreOptions/Unselected.svg';
import { ReactComponent as OptionsIconSelected } from 'assets/images/icons/MoreOptions/Selected.svg';
import { SAVED_SEARCH_QUERY, SEARCHES_COUNT } from 'graphql/queries/Search';
import { COLLECTION_COUNT_SUBSCRIPTION } from 'graphql/subscriptions/PeriodicInfo';
import { setErrorMessage } from 'common/notification';
import Loading from 'components/UI/Layout/Loading/Loading';
import { numberToAbbreviation } from 'common/utils';
import { getUserSession } from 'services/AuthService';
import Tooltip from 'components/UI/Tooltip/Tooltip';
import styles from './SavedSearchToolbar.module.css';

export interface SavedSearchToolbarProps {
  savedSearchCriteriaCallback: Function;
  refetchData?: any;
  onSelect: Function;
  searchMode?: boolean;
}

export const SavedSearchToolbar: React.FC<SavedSearchToolbarProps> = ({
  searchMode,
  refetchData,
  savedSearchCriteriaCallback,
  onSelect,
}) => {
  const [selectedSavedSearch, setSelectedSavedSearch] = useState<number | null>(null);
  const [optionsSelected, setOptionsSelected] = useState(false);
  const [fixedSearches, setFixedSearches] = useState<any>([]);
  const [searchesCount, setSearchesCount] = useState<any>({});
  const [anchorEl, setAnchorEl] = useState(null);
  const Ref = useRef(null);
  const open = Boolean(anchorEl);
  const variables = { organizationId: getUserSession('organizationId') };

  const { data: collectionCount } = useSubscription(COLLECTION_COUNT_SUBSCRIPTION, { variables });

  const { data: countData } = useQuery<any>(SEARCHES_COUNT, {
    variables,
  });

  useEffect(() => {
    if (countData) {
      const collectionStats = JSON.parse(countData.collectionStats);
      if (collectionStats[variables.organizationId]) {
        setSearchesCount(collectionStats[variables.organizationId]);
      }
    }
  }, [countData]);

  useEffect(() => {
    if (collectionCount) {
      const countDataSubscription = JSON.parse(collectionCount.collectionCount);
      setSearchesCount(countDataSubscription.collection);
    }
  }, [collectionCount]);

  // default query variables
  const queryVariables = {
    filter: { isReserved: true },
    opts: {},
  };

  // remove selected searches on search
  if (searchMode && selectedSavedSearch) {
    setSelectedSavedSearch(null);
  }

  const { loading, error, refetch } = useQuery<any>(SAVED_SEARCH_QUERY, {
    variables: queryVariables,
    onCompleted: (data) => {
      setFixedSearches(data.savedSearches);
    },
  });

  const handlerSavedSearchCriteria = (
    savedSearchCriteria: string | null,
    savedSearchId: number | null
  ) => {
    savedSearchCriteriaCallback(savedSearchCriteria, savedSearchId);
    setSelectedSavedSearch(savedSearchId);
  };

  const handleAdditionalSavedSearch = (search: any) => {
    const replaceSearchIndex = fixedSearches
      .map((savedSearch: any) => savedSearch.id)
      .indexOf(search.id);
    const fixedSearchesCopy = JSON.parse(JSON.stringify(fixedSearches));
    if (replaceSearchIndex !== -1) {
      [fixedSearchesCopy[replaceSearchIndex], fixedSearchesCopy[2]] = [
        fixedSearches[2],
        fixedSearches[replaceSearchIndex],
      ];
      setFixedSearches(fixedSearchesCopy);
    }
    handlerSavedSearchCriteria(search.args, search.id);
  };

  useEffect(() => {
    // display created searches
    if (refetchData.savedSearches) {
      refetch();
      handleAdditionalSavedSearch(refetchData.savedSearches);
    }
  }, [refetchData.savedSearches]);

  if (loading) return <Loading />;
  if (error) {
    setErrorMessage(error);
    return <div>error</div>;
  }

  const savedSearchList = fixedSearches.slice(0, 3).map((savedSearch: any) => {
    // set the selected class if the button is clicked
    const labelClass = [styles.SavedSearchItemLabel];
    const countClass = [styles.SavedSearchCount];
    if (savedSearch.id === selectedSavedSearch) {
      labelClass.push(styles.SavedSearchItemSelected);
      countClass.push(styles.SavedSearchSelectedCount);
    }

    const count = searchesCount[savedSearch.shortcode] ? searchesCount[savedSearch.shortcode] : 0;
    return (
      <div
        data-testid="savedSearchDiv"
        className={styles.SavedSearchItem}
        key={savedSearch.id}
        onClick={() => {
          handlerSavedSearchCriteria(savedSearch.args, savedSearch.id);
          onSelect();
        }}
        onKeyDown={() => {
          handlerSavedSearchCriteria(savedSearch.args, savedSearch.id);
          onSelect();
        }}
        aria-hidden="true"
      >
        <div className={labelClass.join(' ')}>{savedSearch.shortcode}</div>
        <Tooltip title={count} placement="right">
          <div className={countClass.join(' ')}>{numberToAbbreviation(count)}</div>
        </Tooltip>
      </div>
    );
  });

  const handleClickAway = () => {
    setAnchorEl(null);
    setOptionsSelected(false);
  };

  const additionalOptions = (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom"
      transition
      className={styles.PopperContainer}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper elevation={3} className={styles.Popper}>
            {fixedSearches.slice(3, 6).map((search: any) => {
              const count = searchesCount[search.shortcode] ? searchesCount[search.shortcode] : 0;
              return (
                <div
                  key={search.id}
                  className={styles.LabelContainer}
                  onClick={() => handleAdditionalSavedSearch(search)}
                  aria-hidden="true"
                >
                  <span className={styles.Label}>{search.shortcode}</span>
                  <span className={styles.Count}>{numberToAbbreviation(count)}</span>
                </div>
              );
            })}
          </Paper>
        </Fade>
      )}
    </Popper>
  );

  return (
    <div className={styles.SavedSearchToolbar}>
      <div className={styles.SaveSearchContainer}>{savedSearchList}</div>
      <div className={styles.MoreLink}>
        <ClickAwayListener onClickAway={handleClickAway}>
          <IconButton
            onClick={() => {
              setAnchorEl(Ref.current);
              setOptionsSelected(true);
            }}
            aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
            size="small"
            ref={Ref}
          >
            {optionsSelected ? (
              <OptionsIconSelected className={styles.OptionsIcon} />
            ) : (
              <OptionsIcon className={styles.OptionsIcon} />
            )}
          </IconButton>
        </ClickAwayListener>
        {additionalOptions}
      </div>
    </div>
  );
};

export default SavedSearchToolbar;
