import React, { useState } from 'react';
import { SAVED_SEARCH_QUERY } from '../../../graphql/queries/Search';
import { useQuery } from '@apollo/client';
import { setErrorMessage } from '../../../common/notification';
import Loading from '../../../components/UI/Layout/Loading/Loading';

export interface SavedSearchToolbarProps {
  savedSearchCriteriaCallback: Function;
}

export const SavedSearchToolbar: React.SFC<SavedSearchToolbarProps> = (props) => {
  const [selectedSavedSearch, setSelectedSavedSearch] = useState<number | null>(null);

  // default queryvariables
  const queryVariables = { filter: {} };

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
    return (
      <div
        key={savedSearch.id}
        onClick={() => handlerSavedSearchCriteria(savedSearch.args, savedSearch.id)}
      >
        {savedSearch.label}
      </div>
    );
  });

  return <div>{savedSearchList}</div>;
};

export default SavedSearchToolbar;
