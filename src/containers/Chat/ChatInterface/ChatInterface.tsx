import { useState, useEffect } from 'react';
import { Paper, Typography } from '@mui/material';
import { useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Simulator } from 'components/simulator/Simulator';
import Loading from 'components/UI/Layout/Loading/Loading';
import { SEARCH_QUERY } from 'graphql/queries/Search';
import { getUserRole } from 'context/role';
import { setErrorMessage } from 'common/notification';
import { COLLECTION_SEARCH_QUERY_VARIABLES, SEARCH_QUERY_VARIABLES } from 'common/constants';
import ChatConversations from '../ChatConversations/ChatConversations';
import ChatMessages from '../ChatMessages/ChatMessages';
import CollectionConversations from '../CollectionConversations/CollectionConversations';
import SavedSearches from '../SavedSearches/SavedSearches';
import styles from './ChatInterface.module.css';
import HelpIcon from 'components/UI/HelpIcon/HelpIcon';

export interface ChatInterfaceProps {
  savedSearches?: boolean;
  collectionType?: boolean;
}

export const ChatInterface = ({ savedSearches, collectionType }: ChatInterfaceProps) => {
  const navigate = useNavigate();
  const [simulatorAccess, setSimulatorAccess] = useState(true);
  const [simulatorId, setSimulatorId] = useState(0);
  const { t } = useTranslation();

  const params = useParams();

  let selectedContactId = params.contactId;
  let selectedCollectionId: any = params.collectionId;

  // default query variables
  let queryVariables = SEARCH_QUERY_VARIABLES;

  // contact id === collection when the collection id is not passed in the url
  let selectedTab = 'contacts';
  if (selectedCollectionId || collectionType) {
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

  // let's handle the case when the type is collection  then we set the first collection
  // as the selected collection
  if (!selectedContactId && collectionType && data && data.search.length !== 0) {
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
    const tabs = [
      {
        tab: 'Chat',
        link: '/chat/',
        active: false,
      },
      {
        tab: 'Collections',
        link: '/chat/collection/',
        active: false,
      },
      {
        tab: 'Saved searches',
        link: '/chat/saved-searches/',
        active: false,
      },
    ];

    let heading = '';

    if (selectedCollectionId || (selectedTab === 'collections' && !savedSearches)) {
      listingContent = <CollectionConversations collectionId={selectedCollectionId} />;
      heading = 'Collections';
      tabs[1].active = true;
    } else if (selectedContactId && !savedSearches) {
      // let's enable simulator only when contact tab is shown

      listingContent = (
        <ChatConversations contactId={simulatorId > 0 ? simulatorId : selectedContactId} />
      );

      tabs[0].active = true;
      heading = 'Chat';
    } else if (savedSearches) {
      listingContent = <SavedSearches />;
      heading = 'Saved searches';
      tabs[2].active = true;
    }

    const TabHeader = ({ tab }: any) => {
      return (
        <div
          className={`${styles.Tab} ${tab.active && styles.ActiveTab}`}
          onClick={() => navigate(tab.link)}
          key={tab.link}
        >
          <Typography
            className={`${styles.TitleText} ${tab.active && styles.SelectedTab}`}
            variant="h6"
          >
            {t(tab.tab)}
          </Typography>
        </div>
      );
    };

    chatInterface = (
      <>
        <div className={`${styles.ChatMessages} chatMessages`}>
          <ChatMessages
            contactId={simulatorId > 0 ? simulatorId : selectedContactId}
            collectionId={selectedCollectionId}
          />
        </div>

        <div className={`${styles.ChatConversations} ChatConversations`}>
          <div className={styles.Title}>
            {heading}
            <HelpIcon />
          </div>

          <div className={styles.TabContainer}>
            {tabs.map((tab: any) => (
              <TabHeader tab={tab} />
            ))}
          </div>

          <div>{listingContent}</div>
        </div>
      </>
    );
  }

  return (
    <Paper>
      <div className={styles.Chat} data-testid="chatContainer">
        {chatInterface}
      </div>
      {simulatorAccess && !selectedCollectionId ? (
        <Simulator setSimulatorId={setSimulatorId} showSimulator={simulatorId > 0} />
      ) : null}
    </Paper>
  );
};

export default ChatInterface;
