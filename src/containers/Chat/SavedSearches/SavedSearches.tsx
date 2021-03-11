import { useQuery } from '@apollo/client';
import { Container } from '@material-ui/core';
import React, { useState } from 'react';
import { setErrorMessage } from '../../../common/notification';
import { AutoComplete } from '../../../components/UI/Form/AutoComplete/AutoComplete';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import { SAVED_SEARCH_QUERY } from '../../../graphql/queries/Search';
import ConversationList from '../ChatConversations/ConversationList/ConversationList';
import styles from './SavedSearches.module.css';
import searchIcon from '../../../assets/images/icons/Search/Desktop.svg';

export interface SavedSearchesProps {
  collectionId?: number | null;
}

// default query variables
const queryVariables = {
  filter: {},
  opts: {},
};

const label = (
  <div className={styles.SearchIcon}>
    <img src={searchIcon} alt="Search" /> Search
  </div>
);

const SavedSearches: React.SFC<SavedSearchesProps> = () => {
  const [savedSearch, setSavedSearch] = useState({ id: 0, args: '{}' });
  const [Open, setOpen] = useState(true);

  const { loading, error, data, client } = useQuery<any>(SAVED_SEARCH_QUERY, {
    variables: queryVariables,
  });

  if (loading) return <Loading />;

  if (error) {
    setErrorMessage(client, error);
    return <div>error</div>;
  }

  let options = [];
  if (data) {
    options = data.savedSearches.filter((searches: any) => !searches.isReserved);
  }

  const changeValue = (event: any, value: any) => {
    setOpen(false);
    if (value) {
      setSavedSearch(value);
    } else {
      setSavedSearch({ id: 0, args: '{}' });
    }
  };

  return (
    <Container className={styles.ChatConversations} disableGutters data-testid="SavedSearches">
      <div className={styles.SavedSearchesAutocomplete}>
        <AutoComplete
          options={options}
          optionLabel="shortcode"
          field={{}}
          form={{ setFieldValue: changeValue }}
          textFieldProps={{
            label,
            variant: 'outlined',
          }}
          multiple={false}
          openOptions={Open}
        />
      </div>
      {savedSearch.id !== 0 ? (
        <ConversationList
          searchVal=""
          searchMode={false}
          searchParam={{}}
          selectedContactId={savedSearch.id}
          savedSearchCriteria={savedSearch.args}
          savedSearchCriteriaId={savedSearch.id}
          entityType="savedSearch"
        />
      ) : null}
    </Container>
  );
};

export default SavedSearches;
