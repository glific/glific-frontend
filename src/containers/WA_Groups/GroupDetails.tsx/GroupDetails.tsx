import { useQuery } from '@apollo/client';
import { Box, Button, List, Typography } from '@mui/material';
import { GROUP_QUERY_VARIABLES } from 'common/constants';
import { Heading } from 'components/UI/Heading/Heading';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WA_Groups';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styles from './GroupDetails.module.css';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';

export const GroupDetails = () => {
  const params = useParams();
  const { t } = useTranslation();
  const [conversationInfo, setConversationInfo] = useState<any>({});
  let groupId = params.id;

  let mockGroupData: any = [
    { name: 'Chrissy Corn', maskePhone: '3792******38' },
    { name: 'Chrissy Corn', maskePhone: '7839******42' },
    { name: 'Chrissy Corn', maskePhone: '8293******23' },
  ];

  const {
    loading: conversationLoad,
    error: conversationError,
    data: allConversations,
  }: any = useQuery(GROUP_SEARCH_QUERY, {
    variables: GROUP_QUERY_VARIABLES,
    fetchPolicy: 'cache-only',
  });

  const findContactInAllConversations = () => {
    if (allConversations && allConversations.search) {
      // loop through the cached conversations and find if contact exists
      // need to check - updateConversationInfo('contact', contactId);
      allConversations.search.map((conversation: any, index: any) => {
        if (conversation.waGroup?.id === groupId?.toString()) {
          setConversationInfo(conversation?.waGroup);
        }
        return null;
      });
    }
  };

  useEffect(() => {
    if (groupId) {
      findContactInAllConversations();
    }
  }, [groupId, allConversations]);
  const dialogTitle = t('Are you sure you want to remove contact from this collection?');
  const dialogMessage = t('The contact will no longer receive messages sent to this collection');

  const columnNames = [{ name: 'name', label: t('Beneficiary') }, { label: t('Actions') }];

  const additionalAction = () => [
    {
      icon: <ArrowForwardIcon className={styles.RedirectArrow} />,
      label: t('View profile'),
      link: '/contact-profile',
      parameter: 'id',
    },
  ];

  const removeCollectionButton = (
    <Button variant="contained" color="error" onClick={() => {}}>
      Remove contacts
    </Button>
  );

  const getName = (label: string, phone: string) => (
    <div>
      <div className={styles.NameText}>{label}</div>
      <div className={styles.Phone}>{phone}</div>
    </div>
  );
  const getCollections = (collections: Array<any>) => (
    <div className={styles.CollectionsText}>
      {collections.map((collection: any) => collection.label).join(', ')}
    </div>
  );

  const getColumns = ({ name, maskedPhone, groups }: any) => ({
    label: getName(name, maskedPhone),
    groups: getCollections(groups),
  });
  const columnStyles = [styles.Name, styles.Phone, styles.Actions];

  const collectionIcon = <CollectionIcon className={styles.CollectionIcon} />;
  const columnAttributes = {
    columns: getColumns,
    columnStyles,
  };

  return (
    <>
      <Heading formTitle={t('Group Details')} showHeaderHelp={false} />
      {/* <Box>
        <List
          dialogTitle={dialogTitle}
          columnNames={columnNames}
          title={'title'}
          additionalAction={additionalAction}
          secondaryButton={removeCollectionButton}
          listItem="contacts"
          listItemName="contact"
          searchParameter={['term']}
          button={{ show: false, label: '' }}
          pageLink="contact"
          listIcon={collectionIcon}
          editSupport={false}
          dialogMessage={dialogMessage}
          //   {...queries}
          {...columnAttributes}
        />
      </Box> */}
    </>
  );
};

export default GroupDetails;
