import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { SAVED_SEARCH_QUERY } from '../../../graphql/queries/Search';
import { setErrorMessage } from '../../../common/notification';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import styles from './SavedSearchToolbar.module.css';
import { IconButton } from '@material-ui/core';

export interface SavedSearchToolbarProps {
  savedSearchCriteriaCallback: Function;
}

export const SavedSearchToolbar: React.SFC<SavedSearchToolbarProps> = (props) => {
  const [selectedSavedSearch, setSelectedSavedSearch] = useState<number | null>(null);

  // default queryvariables
  const queryVariables = {
    filter: {},
    opts: {
      limit: 3,
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

  const savedSearchList = data.savedSearches.map((savedSearch: any) => {
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

  return (
    <div className={styles.SavedSearchToolbar}>
      <div className={styles.SaveSearchContainer}>{savedSearchList}</div>
      <div className={styles.MoreLink}>
        <IconButton aria-label="more" aria-controls="long-menu" aria-haspopup="true" size="small">
          <MoreVertIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default SavedSearchToolbar;
