import { useState } from 'react';
import { Paper, Tab, Tabs, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { GROUP_QUERY_VARIABLES } from 'common/constants';
import ChatConversations from 'containers/Chat/ChatConversations/ChatConversations';
import ChatMessages from 'containers/Chat/ChatMessages/ChatMessages';
import { setErrorMessage } from 'common/notification';
import CollectionConversations from 'containers/Chat/CollectionConversations/CollectionConversations';
import styles from './GroupChatInterface.module.css';
import { groupCollectionSearchQuery } from 'mocks/Groups';
import { useQuery } from '@apollo/client';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WA_Groups';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { WaManagedPhones } from '../WaManagedPhones/WaManagedPhones';

const tabs = [
  {
    label: 'Groups',
    link: '/group/chat/',
  },
  {
    label: 'Collections',
    link: '/group/chat/collection/',
  },
];
export interface GroupChatInterfaceProps {
  collections?: boolean;
}

export const GroupChatInterface = ({ collections }: GroupChatInterfaceProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [value, setValue] = useState(tabs[0].link);
  const params = useParams();
  const [phonenumber, setPhonenumber] = useState<string>('1');

  let selectedGroupId = params.groupId;
  let selectedCollectionId: any = params.collectionId;

  const {
    loading,
    error,
    data: dataa,
  } = useQuery<any>(GROUP_SEARCH_QUERY, {
    variables: GROUP_QUERY_VARIABLES,
    fetchPolicy: 'cache-only',
  });

  // group id === collection when the collection id is not passed in the url
  let selectedTab = 'groups';
  if (selectedCollectionId || collections) {
    selectedTab = 'collections';
  }

  const data = collections ? groupCollectionSearchQuery()?.result?.data : dataa;

  // let's handle the case when the type is collection  then we set the first collection
  // as the selected collection
  if (!selectedGroupId && collections && data && data?.search.length !== 0) {
    if (data?.search[0].group) {
      selectedCollectionId = data?.search[0].group.id;
      selectedGroupId = '';
    }
  }

  // let's handle the case when group id and collection id is not passed in the url then we set the
  // first record as selected group
  if (!selectedGroupId && !selectedCollectionId && data && data?.search.length !== 0) {
    if (data?.search[0].waGroup) {
      selectedGroupId = data?.search[0].waGroup?.id;
    }
  }

  const noConversations = (
    <Typography variant="h5" className={styles.NoConversations}>
      {t('There are no chat conversations to display.')}
    </Typography>
  );

  let groupChatInterface: any;
  let listingContent;
  let phonesDropDown: any;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    navigate(newValue);
  };

  if (data && data?.search.length === 0) {
    groupChatInterface = noConversations;
  } else {
    let heading = '';

    if (selectedCollectionId || selectedTab === 'collections') {
      listingContent = <CollectionConversations groups collectionId={selectedCollectionId} />;
      heading = 'Group Collections';
    } else if (selectedGroupId) {
      // let's enable simulator only when group tab is shown
      phonesDropDown = (
        <WaManagedPhones phonenumber={phonenumber} setPhonenumber={setPhonenumber} />
      );
      listingContent = (
        <ChatConversations
          phonenumber={phonenumber}
          filterComponent={phonesDropDown}
          contactId={selectedGroupId}
        />
      );

      heading = 'Groups';
    }

    groupChatInterface = (
      <>
        <div className={`${styles.ChatMessages} chatMessages`}>
          <ChatMessages
            contactId={selectedGroupId}
            collectionId={selectedCollectionId}
            phoneId={phonenumber}
            setPhonenumber={setPhonenumber}
          />
        </div>

        <div className={`${styles.ChatConversations} ChatConversations`}>
          <div className={styles.Title}>
            <div className={styles.Heading}> {heading}</div>
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

  if (loading) return <Loading />;
  if (error) {
    setErrorMessage(error);
    return null;
  }

  return (
    <Paper>
      <div className={styles.Chat} data-testid="chatContainer">
        {groupChatInterface}
      </div>
    </Paper>
  );
};

export default GroupChatInterface;
