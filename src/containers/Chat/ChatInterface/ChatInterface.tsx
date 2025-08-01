import { useState, useEffect } from 'react';
import { Paper, Tab, Tabs } from '@mui/material';
import { useQuery } from '@apollo/client';
import { useLocation, useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import Simulator from 'components/simulator/Simulator';
import { Loading } from 'components/UI/Layout/Loading/Loading';
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

const tabs = [
  {
    label: 'Contacts',
    link: '/chat',
  },
  {
    label: 'Collections',
    link: '/chat/collection',
  },
  {
    label: 'Searches',
    link: '/chat/saved-searches',
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
  const location = useLocation();
  const params = useParams();
  const [value, setValue] = useState(tabs[0].link);
  const [appliedFilters, setAppliedFilters] = useState<any>({});

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

  useEffect(() => {
    const currentTab = tabs.filter((tab) => location.pathname === tab.link);
    if (currentTab.length) {
      setValue(currentTab[0].link);
    }
  }, [location]);

  if (loading) return <Loading />;
  if (error) {
    setErrorMessage(error);
    return null;
  }

  // let's handle the case when the type is collection  then we set the first collection
  // as the selected collection
  if (!selectedContactId && !selectedCollectionId && collectionType && data && data.search.length !== 0) {
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

  const NoConversations = (
    <div className={styles.NoConversationsContainer}>
      <p data-testid="empty-result" className={styles.NoConversations}>
        {t('There are no chat conversations to display.')}
      </p>
    </div>
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
    return NoConversations;
  } else {
    let heading = '';

    if (selectedCollectionId || (selectedTab === 'collections' && !savedSearches)) {
      listingContent = <CollectionConversations collectionId={selectedCollectionId} />;
      heading = 'Collections';
    } else if (selectedContactId && !savedSearches) {
      // let's enable simulator only when contact tab is shown

      listingContent = (
        <ChatConversations
          entityId={simulatorId > 0 ? simulatorId : selectedContactId}
          setAppliedFilters={setAppliedFilters}
        />
      );

      heading = 'Contacts';
    } else if (savedSearches) {
      listingContent = <SavedSearches />;
      heading = 'Saved searches';
    }

    chatInterface = (
      <>
        <div className={`${styles.ChatMessages} chatMessages`}>
          <ChatMessages
            entityId={simulatorId > 0 ? simulatorId : selectedContactId}
            collectionId={selectedCollectionId}
            appliedFilters={appliedFilters}
          />
        </div>

        <div className={`${styles.ChatConversations} ChatConversations`}>
          <div className={styles.Title}>
            <div data-testid="heading" className={styles.Heading}>
              {' '}
              {heading}
            </div>
          </div>

          <div className={styles.TabContainer}>
            <Tabs value={value} onChange={handleTabChange} aria-label="chat tabs">
              {tabs.map((tab) => (
                <Tab
                  key={tab.label}
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
      {selectedTab === 'contacts' && !savedSearches && (
        <SimulatorIcon
          data-testid="simulatorIcon"
          className={styles.SimulatorIcon}
          onClick={() => {
            setShowSimulator(!showSimulator);
            if (showSimulator) {
              setSimulatorId(0);
            }
          }}
        />
      )}
      {simulatorAccess && !selectedCollectionId && showSimulator ? (
        <Simulator setShowSimulator={handleCloseSimulator} getSimulatorId={getSimulatorId} />
      ) : null}
    </Paper>
  );
};

export default ChatInterface;
