import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { IconButton, Popper, Fade, Paper, ClickAwayListener } from '@material-ui/core';

import styles from './SavedSearchToolbar.module.css';
import { ReactComponent as OptionsIcon } from '../../../assets/images/icons/MoreOptions/Unselected.svg';
import { ReactComponent as OptionsIconSelected } from '../../../assets/images/icons/MoreOptions/Selected.svg';
import { SAVED_SEARCH_QUERY, SEARCHES_COUNT } from '../../../graphql/queries/Search';
import { setErrorMessage } from '../../../common/notification';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { COLLECTION_COUNT_SUBSCRIPTION } from '../../../graphql/subscriptions/PeriodicInfo';
import { getUserSession } from '../../../services/AuthService';

export interface SavedSearchToolbarProps {
  savedSearchCriteriaCallback: Function;
  refetchData?: any;
  onSelect: Function;
  searchMode?: boolean;
}

export const SavedSearchToolbar: React.SFC<SavedSearchToolbarProps> = (props) => {
  const { searchMode, refetchData } = props;
  const [selectedSavedSearch, setSelectedSavedSearch] = useState<number | null>(null);
  const [optionsSelected, setOptionsSelected] = useState(false);
  const [fixedSearches, setFixedSearches] = useState<any>([]);
  const [searchesCount, setSearchesCount] = useState<any>({});
  const [additionalSearch, setAdditionalSearch] = useState<any>([]);
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
    filter: {},
    opts: {},
  };

  // remove selected searches on search
  if (searchMode && selectedSavedSearch) {
    setSelectedSavedSearch(null);
  }

  const { loading, error, client, refetch } = useQuery<any>(SAVED_SEARCH_QUERY, {
    variables: queryVariables,
    onCompleted: (data) => {
      setFixedSearches(data.savedSearches.filter((searches: any) => searches.isReserved));
      setAdditionalSearch(data.savedSearches.filter((searches: any) => !searches.isReserved));
    },
  });

  const handlerSavedSearchCriteria = (
    savedSearchCriteria: string | null,
    savedSearchId: number | null
  ) => {
    props.savedSearchCriteriaCallback(savedSearchCriteria, savedSearchId);
    setSelectedSavedSearch(savedSearchId);
  };

  const handleAdditionalSavedSearch = (search: any) => {
    const replaceSearchIndex = fixedSearches
      .map((savedSearch: any) => savedSearch.id)
      .indexOf(search.id);
    const fixedSearchesCopy = fixedSearches;
    if (replaceSearchIndex !== -1) {
      [fixedSearches[replaceSearchIndex], fixedSearches[2]] = [
        fixedSearches[2],
        fixedSearches[replaceSearchIndex],
      ];
      setFixedSearches(fixedSearchesCopy);
    }
    handlerSavedSearchCriteria(search.args, search.id);
  };

  useEffect(() => {
    // display created searches
    if (refetchData.savedSearchCollection) {
      refetch();
      handleAdditionalSavedSearch(refetchData.savedSearchCollection);
    }
  }, [refetchData.savedSearchCollection]);

  if (loading) return <Loading />;
  if (error) {
    setErrorMessage(client, error);
    return null;
  }

  const savedSearchList = fixedSearches.slice(0, 3).map((savedSearch: any) => {
    // set the selected class if the button is clicked
    const labelClass = [styles.SavedSearchItemLabel];
    const countClass = [styles.SavedSearchCount];
    if (savedSearch.id === selectedSavedSearch) {
      labelClass.push(styles.SavedSearchItemSelected);
      countClass.push(styles.SavedSearchSelectedCount);
    }

    return (
      <div
        data-testid="savedSearchDiv"
        className={styles.SavedSearchItem}
        key={savedSearch.id}
        onClick={() => {
          handlerSavedSearchCriteria(savedSearch.args, savedSearch.id);
          props.onSelect();
        }}
        onKeyDown={() => {
          handlerSavedSearchCriteria(savedSearch.args, savedSearch.id);
          props.onSelect();
        }}
        aria-hidden="true"
      >
        <div className={labelClass.join(' ')}>{savedSearch.shortcode}</div>
        <div className={countClass.join(' ')}>
          {searchesCount[savedSearch.shortcode] ? searchesCount[savedSearch.shortcode] : 0}
        </div>
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
            {fixedSearches.slice(3, 6).map((search: any) => (
              <div
                key={search.id}
                className={styles.LabelContainer}
                onClick={() => handleAdditionalSavedSearch(search)}
                aria-hidden="true"
              >
                <span className={styles.Label}>{search.shortcode}</span>
                <span className={styles.Count}>
                  {searchesCount[search.shortcode] ? searchesCount[search.shortcode] : 0}
                </span>
              </div>
            ))}
            {additionalSearch.map((search: any) => (
              <div
                key={search.id}
                className={styles.LabelContainer}
                onClick={() => handleAdditionalSavedSearch(search)}
                aria-hidden="true"
              >
                <span className={styles.Label}>{search.shortcode}</span>
              </div>
            ))}
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
