import { useQuery } from '@apollo/client';
import { Container } from '@material-ui/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import searchIcon from 'assets/images/icons/Search/Desktop.svg';
import { setErrorMessage } from 'common/notification';
import { AutoComplete } from 'components/UI/Form/AutoComplete/AutoComplete';
import Loading from 'components/UI/Layout/Loading/Loading';
import { SAVED_SEARCH_QUERY } from 'graphql/queries/Search';
import ConversationList from 'containers/Chat/ChatConversations/ConversationList/ConversationList';
import styles from './SavedSearches.module.css';

// default query variables
const queryVariables = {
  filter: { isReserved: false },
  opts: {},
};

const SavedSearches = () => {
  const [savedSearch, setSavedSearch] = useState({ id: 0, args: '{}' });
  const [Open, setOpen] = useState(true);
  const { t } = useTranslation();

  const { loading, error, data } = useQuery<any>(SAVED_SEARCH_QUERY, {
    variables: queryVariables,
  });

  if (loading) return <Loading />;

  if (error) {
    setErrorMessage(error);
    return <div>{t('Error :(')}</div>;
  }

  let options = [];
  if (data) {
    options = data.savedSearches;
  }

  const changeValue = (event: any, value: any) => {
    if (value) {
      setSavedSearch(value);
      setOpen(false);
    } else {
      setOpen(true);
      setSavedSearch({ id: 0, args: '{}' });
    }
  };

  const label = (
    <div className={styles.SearchIcon}>
      <img src={searchIcon} alt="Search" /> {t('Search')}
    </div>
  );

  return (
    <Container className={styles.ChatConversations} disableGutters data-testid="SavedSearches">
      <div className={styles.SavedSearchesAutocomplete}>
        <AutoComplete
          options={options}
          classes={{ paper: styles.Paper, listbox: styles.Listbox }}
          optionLabel="shortcode"
          field={{}}
          form={{ setFieldValue: changeValue }}
          textFieldProps={{
            label,
            variant: 'outlined',
          }}
          multiple={false}
          openOptions={Open}
          listBoxProps={{ style: { maxHeight: 'calc(100vh - 220px)' } }}
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
