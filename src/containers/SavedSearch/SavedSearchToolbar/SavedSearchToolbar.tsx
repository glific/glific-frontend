import React, { useState } from 'react';
import { useQuery } from '@apollo/client';

import { SAVED_SEARCH_QUERY } from '../../../graphql/queries/Search';
import { setErrorMessage } from '../../../common/notification';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { Button } from '../../../components/UI/Form/Button/Button';
import styles from './SavedSearchToolbar.module.css';

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
    // we should unset the saved saved when click on the same and revert to orginal result
    if (selectedSavedSearch === savedSearchId) {
      savedSearchId = null;
      savedSearchCriteria = null;
    }
    props.savedSearchCriteriaCallback(savedSearchCriteria);
    setSelectedSavedSearch(savedSearchId);
  };

  const savedSearchList = data.savedSearches.map((savedSearch: any) => {
    // set the selected class if the button is clicked
    let buttonClass = styles.Button;
    let countClass = [styles.conversationCount];
    if (savedSearch.id === selectedSavedSearch) {
      buttonClass = styles.ButtonSelected;
      countClass.push(styles.conversationCountSelected);
    }

    return (
      <Button
        key={savedSearch.id}
        variant="text"
        color="primary"
        className={buttonClass}
        onClick={() => handlerSavedSearchCriteria(savedSearch.args, savedSearch.id)}
      >
        {savedSearch.shortcode}
        <span className={countClass.join(' ')}>{savedSearch.count}</span>
      </Button>
    );
  });

  return <div className={styles.SavedSearchToolbar}>{savedSearchList}</div>;
};

export default SavedSearchToolbar;
