import React, { useState, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { ReactComponent as OptionsIcon } from '../../../assets/images/icons/MoreOptions/Unselected.svg';

import { SAVED_SEARCH_QUERY } from '../../../graphql/queries/Search';
import { setErrorMessage } from '../../../common/notification';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import styles from './SavedSearchToolbar.module.css';
import { IconButton, Popper, Fade, Paper, ClickAwayListener } from '@material-ui/core';

export interface SavedSearchToolbarProps {
  savedSearchCriteriaCallback: Function;
}

export const SavedSearchToolbar: React.SFC<SavedSearchToolbarProps> = (props) => {
  const [selectedSavedSearch, setSelectedSavedSearch] = useState<number | null>(null);

  const Ref = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // default queryvariables
  const queryVariables = {
    filter: {},
    opts: {
      limit: 10,
    },
  };

  const { loading, error, data, client } = useQuery<any>(SAVED_SEARCH_QUERY, {
    variables: queryVariables,
  });

  if (loading) return <Loading />;
  if (error) {
    setErrorMessage(client, error);
    return null;
  }

  const handlerSavedSearchCriteria = (
    savedSearchCriteria: string | null,
    savedSearchId: number | null
  ) => {
    props.savedSearchCriteriaCallback(savedSearchCriteria);
    setSelectedSavedSearch(savedSearchId);
  };

  const importantSearches = data.savedSearches.slice(0, 3);
  const restSearches = data.savedSearches.slice(3);

  const savedSearchList = importantSearches.map((savedSearch: any) => {
    // set the selected class if the button is clicked
    let labelClass = [styles.SavedSearchItemLabel];
    let countClass = [styles.SavedSearchCount];
    if (savedSearch.id === selectedSavedSearch) {
      labelClass.push(styles.SavedSearchItemSelected);
      countClass.push(styles.SavedSearchSelectedCount);
    }

    return (
      <div
        data-testid="savedSearchDiv"
        className={styles.SavedSearchItem}
        key={savedSearch.id}
        onClick={() => handlerSavedSearchCriteria(savedSearch.args, savedSearch.id)}
      >
        <div className={labelClass.join(' ')}>{savedSearch.shortcode}</div>
        <div className={countClass.join(' ')}>{savedSearch.count}</div>
      </div>
    );
  });

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  const additonalOptions = (
    <Popper open={open} anchorEl={anchorEl} placement={'bottom-end'} transition>
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper elevation={3}>
            {restSearches.map((search: any) => {
              return (
                <div
                  className={styles.LabelContainer}
                  onClick={() => handlerSavedSearchCriteria(search.args, search.id)}
                >
                  <span className={styles.Label}>{search.shortcode}</span>
                  <span className={styles.Count}>{search.count}</span>
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
          <IconButton aria-label="more" aria-controls="long-menu" aria-haspopup="true" size="small">
            <OptionsIcon ref={Ref} onClick={() => setAnchorEl(Ref.current)} />
          </IconButton>
        </ClickAwayListener>
        {additonalOptions}
      </div>
    </div>
  );
};

export default SavedSearchToolbar;
