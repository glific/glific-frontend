import { useState, useEffect } from 'react';
import { Paper, Tab, Tabs, Typography } from '@mui/material';
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
import SimulatorIcon from 'assets/images/icons/Simulator.svg?react';
import CollectionConversations from '../CollectionConversations/CollectionConversations';
import SavedSearches from '../SavedSearches/SavedSearches';
import styles from './ChatInterface.module.css';
import HelpIcon from 'components/UI/HelpIcon/HelpIcon';

const tabs = [
  {
    label: 'Chat',
    link: '/chat/',
  },
  {
    label: 'Collections',
    link: '/chat/collection/',
  },
  {
    label: 'Searches',
    link: '/chat/saved-searches/',
  },
];
export interface ChatInterfaceProps {
  savedSearches?: boolean;
  collectionType?: boolean;
}

export const ChatInterface = ({ savedSearches, collectionType }: ChatInterfaceProps) => {
  const navigate = useNavigate();
  const [simulatorAccess, setSimulatorAccess] = useState(true);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorId, setSimulatorId] = useState(0);
  const { t } = useTranslation();
  const [value, setValue] = useState(tabs[0].link);
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

  const getSimulatorId = (id: any) => {
    setSimulatorId(id);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    navigate(newValue);
  };

  if (data && data.search.length === 0) {
    chatInterface = noConversations;
  } else {
    let heading = '';

    if (selectedCollectionId || (selectedTab === 'collections' && !savedSearches)) {
      listingContent = <CollectionConversations collectionId={selectedCollectionId} />;
      heading = 'Collections';
    } else if (selectedContactId && !savedSearches) {
      // let's enable simulator only when contact tab is shown

      listingContent = (
        <ChatConversations contactId={simulatorId > 0 ? simulatorId : selectedContactId} />
      );

      heading = 'Chat';
    } else if (savedSearches) {
      listingContent = <SavedSearches />;
      heading = 'Saved searches';
    }

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
            <Tabs value={value} onChange={handleTabChange} aria-label="basic tabs example">
              {tabs.map((tab) => (
                <Tab
                  classes={{ selected: styles.TabSelected }}
                  className={styles.Tab}
                  label={tab.label}
                  value={tab.link}
                  disableRipple
                />
              ))}
            </Tabs>
          </div>

          <div>{listingContent}</div>
        </div>
      </>
    );
  }

  const handleCloseSimulator = (value: boolean) => {
    setShowSimulator(value);
    setSimulatorId(0);
  };

  return (
    <Paper>
      <div className={styles.Chat} data-testid="chatContainer">
        {chatInterface}
      </div>
      <SimulatorIcon
        className={styles.SimulatorIcon}
        onClick={() => {
          setShowSimulator(!showSimulator);
          if (showSimulator) {
            setSimulatorId(0);
          }
        }}
      />
      {simulatorAccess && !selectedCollectionId && showSimulator ? (
        <Simulator setShowSimulator={handleCloseSimulator} getSimulatorId={getSimulatorId} />
      ) : null}
    </Paper>
  );
};

export default ChatInterface;
