import React from 'react';
import { SAVED_SEARCH_QUERY } from '../../../graphql/queries/Search';
import { useQuery } from '@apollo/client';
import { setErrorMessage } from '../../../common/notification';
import Loading from '../../../components/UI/Layout/Loading/Loading';

export interface SavedSearchToolbarProps {}

export const SavedSearchToolbar: React.SFC<SavedSearchToolbarProps> = () => {
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

  const savedSearchList = data.savedSearches.map((savedSearch: any) => {
    return <div>{savedSearch.label}</div>;
  });

  return <div>{savedSearchList}</div>;
};

export default SavedSearchToolbar;
