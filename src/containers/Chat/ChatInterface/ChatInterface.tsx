import React, { useState, useEffect } from 'react';
import { Paper, Toolbar, Typography } from '@material-ui/core';
import { useQuery } from '@apollo/client';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Simulator } from 'components/simulator/Simulator';
import Loading from 'components/UI/Layout/Loading/Loading';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import { getUserRole } from 'context/role';
import { setErrorMessage } from 'common/notification';
import { COLLECTION_SEARCH_QUERY_VARIABLES, SEARCH_QUERY_VARIABLES } from 'common/constants';
import selectedChatIcon from 'assets/images/icons/Chat/SelectedContact.svg';
import unselectedChatIcon from 'assets/images/icons/Chat/Unselected.svg';
import collectionIcon from 'assets/images/icons/Chat/Collection.svg';
import selectedCollectionIcon from 'assets/images/icons/Chat/SelectedCollection.svg';
import savedSearchIcon from 'assets/images/icons/Chat/SavedSearch.svg';
import selectedSavedSearchIcon from 'assets/images/icons/Chat/SelectedSavedSearch.svg';
import ChatConversations from '../ChatConversations/ChatConversations';
import ChatMessages from '../ChatMessages/ChatMessages';
import CollectionConversations from '../CollectionConversations/CollectionConversations';
import SavedSearches from '../SavedSearches/SavedSearches';
import styles from './ChatInterface.module.css';

export interface ChatInterfaceProps {
  savedSearches?: boolean;
}

export const ChatInterface = ({ savedSearches }: ChatInterfaceProps) => {
  const [simulatorAccess, setSimulatorAccess] = useState(true);
  const [simulatorId, setSimulatorId] = useState(0);
  const { t } = useTranslation();
  const [startingHeight] = useState(
    `${window.innerWidth < 768 ? window.innerHeight - 46 : window.innerHeight}px`
  );
  const params = useParams();

  let selectedContactId = params.contactId;
  let selectedCollectionId = params.collectionId;

  // default query variables
  let queryVariables = SEARCH_QUERY_VARIABLES;

  // contact id === collection when the collection id is not passed in the url
  let selectedTab = 'contacts';
  if (selectedCollectionId) {
    queryVariables = COLLECTION_SEARCH_QUERY_VARIABLES;
    selectedTab = 'collections';
  }

  // fetch the conversations from cache
  const { loading, error, data } = useQuery<any>(SEARCH_QUERY, {
    variables: queryVariables,
    fetchPolicy: 'cache-only',
  });

  useEffect(() => {
    if (getUserRole().includes('Staff')) {
      setSimulatorAccess(false);
    }
  }, []);

  if (loading) return <Loading />;
  if (error) {
    setErrorMessage(error);
    return null;
  }

  // let's handle the case when collection id is -1 then we set the first collection
  // as the selected collection
  if (!selectedContactId && selectedCollectionId === -1 && data && data.search.length !== 0) {
    if (data.search[0].group) {
      selectedCollectionId = data.search[0].group.id;
      selectedContactId = '';
    }
  }

  // let's handle the case when contact id and collection id is not passed in the url then we set the
  // first record as selected contact
  if (!selectedContactId && !selectedCollectionId && data && data.search.length !== 0) {
    if (data.search[0].contact) {
      selectedContactId = data.search[0].contact.id;
    }
  }

  const noConversations = (
    <Typography variant="h5" className={styles.NoConversations}>
      {t('There are no chat conversations to display.')}
    </Typography>
  );

  let chatInterface: any;
  let listingContent;

  if (data && data.search.length === 0) {
    chatInterface = noConversations;
  } else {
    let contactSelectedClass = '';
    let collectionSelectedClass = '';
    let savedSearchClass = '';

    if (selectedCollectionId || (selectedTab === 'collections' && !savedSearches)) {
      listingContent = <CollectionConversations collectionId={selectedCollectionId} />;
      // set class for collections tab
      collectionSelectedClass = `${styles.SelectedTab}`;
    } else if (selectedContactId && !savedSearches) {
      // let's enable simulator only when contact tab is shown

      listingContent = (
        <ChatConversations contactId={simulatorId > 0 ? simulatorId : selectedContactId} />
      );

      // set class for contacts tab
      contactSelectedClass = `${styles.SelectedTab}`;
    } else if (savedSearches) {
      // set class for saved search
      savedSearchClass = `${styles.SelectedTab}`;
      // for saved search
      listingContent = <SavedSearches />;
    }

    chatInterface = (
      <>
        <div className={`${styles.ChatMessages} chatMessages`}>
          <ChatMessages
            startingHeight={startingHeight}
            contactId={simulatorId > 0 ? simulatorId : selectedContactId}
            collectionId={selectedCollectionId}
          />
        </div>

        <div className={`${styles.ChatConversations} ChatConversations`}>
          <Toolbar className={styles.ToolBar}>
            <div className={styles.TabContainer}>
              <div>
                <Link to="/chat">
                  <div className={styles.Title}>
                    <div className={styles.IconBackground}>
                      <img
                        src={contactSelectedClass ? selectedChatIcon : unselectedChatIcon}
                        height="24"
                        className={styles.Icon}
                        alt="Conversation"
                      />
                    </div>
                    <div>
                      <Typography
                        className={`${styles.TitleText} ${contactSelectedClass}`}
                        variant="h6"
                      >
                        {t('Contacts')}
                      </Typography>
                    </div>
                  </div>
                </Link>
                <div
                  className={`${
                    contactSelectedClass ? styles.DarkHighLighter : styles.LightHighLighter
                  }`}
                />
              </div>
              <div>
                <Link to="/chat/collection">
                  <div className={styles.Title}>
                    <div className={styles.IconBackground}>
                      <img
                        src={collectionSelectedClass ? selectedCollectionIcon : collectionIcon}
                        height="24"
                        className={styles.Icon}
                        alt="Conversation"
                      />
                    </div>
                    <div>
                      <Typography
                        className={`${styles.TitleText} ${collectionSelectedClass}`}
                        variant="h6"
                      >
                        {t('Collections')}
                      </Typography>
                    </div>
                  </div>
                </Link>
                <div
                  className={`${
                    collectionSelectedClass ? styles.DarkHighLighter : styles.LightHighLighter
                  }`}
                />
              </div>
              <div>
                <Link to="/chat/saved-searches/">
                  <div className={styles.Title}>
                    <div className={styles.IconBackground}>
                      <img
                        src={savedSearchClass ? selectedSavedSearchIcon : savedSearchIcon}
                        height="24"
                        className={styles.Icon}
                        alt="Conversation"
                      />
                    </div>
                    <div>
                      <Typography
                        className={`${styles.TitleText} ${savedSearchClass}`}
                        variant="h6"
                      >
                        {t('Saved searches')}
                      </Typography>
                    </div>
                  </div>
                </Link>
                <div
                  className={`${
                    savedSearchClass ? styles.DarkHighLighter : styles.LightHighLighter
                  }`}
                />
              </div>
            </div>
          </Toolbar>

          <div>{listingContent}</div>
        </div>
      </>
    );
  }

  return (
    <Paper>
      <div
        className={styles.Chat}
        style={{
          height: startingHeight,
        }}
        data-testid="chatContainer"
      >
        {chatInterface}
      </div>
      {simulatorAccess && !selectedCollectionId ? (
        <Simulator setSimulatorId={setSimulatorId} showSimulator={simulatorId > 0} />
      ) : null}
    </Paper>
  );
};

export default ChatInterface;
