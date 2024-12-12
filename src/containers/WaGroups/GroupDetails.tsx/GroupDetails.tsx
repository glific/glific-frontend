import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import { setNotification } from 'common/notification';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Heading } from 'components/UI/Heading/Heading';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { AvatarDisplay } from 'components/UI/AvatarDisplay/AvatarDisplay';
import { List } from 'containers/List/List';
import { ContactDescription } from 'containers/Profile/Contact/ContactDescription/ContactDescription';
import { UPDATE_GROUP_CONTACT } from 'graphql/mutations/Group';
import { COUNT_COUNTACTS_WA_GROUPS, GET_WA_GROUP, LIST_CONTACTS_WA_GROUPS } from 'graphql/queries/WaGroups';
import styles from './GroupDetails.module.css';

export const GroupDetails = () => {
  const params = useParams();
  const { t } = useTranslation();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteVariables, setDeleteVariables] = useState<any>();
  const [contentToShow, setContentToShow] = useState('members');

  const dialogTitle = 'Are you sure you want to remove this contact from the group?';
  const dialogMessage = 'The contact will no longer receive messages sent to this group';

  const columnNames = [{ label: t('Contact') }, { label: 'All WhatsApp Groups' }, { label: t('Actions') }];

  const list = [
    {
      name: t('Members'),
      section: 'members',
    },
    {
      name: t('Details'),
      section: 'details',
    },
  ];

  const [removeContact, { loading }] = useMutation(UPDATE_GROUP_CONTACT, {
    onCompleted: () => {
      setNotification('Removed Contact from Group', 'success');
      setShowDeleteDialog(false);
    },
  });

  const { loading: groupDataLoading, data } = useQuery(GET_WA_GROUP, {
    variables: {
      waGroupId: params.id,
    },
  });

  const groupData = data?.waGroup?.waGroup;

  const queries = {
    countQuery: COUNT_COUNTACTS_WA_GROUPS,
    filterItemsQuery: LIST_CONTACTS_WA_GROUPS,
    deleteItemQuery: UPDATE_GROUP_CONTACT,
  };

  const getName = (contact: any, maytapiNumber: any, isAdmin: boolean) => (
    <div className={styles.Contact}>
      <div className={styles.NameContainer}>
        <div data-testid="contact-name" className={styles.NameText}>
          {maytapiNumber === contact.phone ? 'Maytapi Number' : contact.name || contact.phone}{' '}
          {isAdmin ? <span className={styles.AdminTag}>Admin</span> : null}
        </div>
        {(contact.name || maytapiNumber === contact.phone) && (
          <div data-testid="phone-number" className={styles.Phone}>
            {contact.phone}
          </div>
        )}
      </div>
    </div>
  );

  const getGroups = (groups: Array<any>) => {
    if (groups.length > 4) {
      return (
        <div data-testid="contact-groups" className={styles.GroupText}>
          {groups
            .slice(0, 4)
            .map((group: any) => group.label)
            .join(', ')}
          {` + ${groups.length - 4} groups`}
        </div>
      );
    } else {
      return (
        <div data-testid="contact-groups" className={styles.GroupText}>
          {groups.map((group: any) => group.label).join(', ')}
        </div>
      );
    }
  };

  const getColumns = (waGroupContact: any) => {
    const { isAdmin, contact, waGroup } = waGroupContact;

    return {
      name: getName(contact, waGroup.waManagedPhone.phone, isAdmin),
      groups: getGroups(contact.waGroups),
    };
  };

  const collectionIcon = <CollectionIcon className={styles.CollectionIcon} />;
  const columnStyles = [styles.Name, styles.Groups, styles.Actions];

  const columnAttributes = {
    columns: getColumns,
    columnStyles,
  };

  const additionalActions = () => [
    {
      icon: <DeleteIcon data-testid="removeContact" />,
      parameter: 'contact',
      label: t('Remove Contact'),
      dialog: handleDialogOpen,
    },
  ];

  const restrictedAction = () => ({ delete: false, edit: false });

  const handleDialogOpen = (contact: any) => {
    setShowDeleteDialog(true);
    setDeleteVariables({
      addWaContactIds: [],
      deleteWaContactIds: [contact.id],
      waGroupId: params.id,
    });
  };

  const handleRemoveContact = () => {
    removeContact({
      variables: { input: deleteVariables },
    });
  };

  let dialog: any;
  if (showDeleteDialog) {
    dialog = (
      <DialogBox
        title={`Are you sure you want to remove contact from this group?`}
        handleOk={handleRemoveContact}
        handleCancel={() => setShowDeleteDialog(false)}
        colorOk="warning"
        alignButtons="center"
        buttonOkLoading={loading}
      >
        <div className={styles.dialogText}>The contact will no longer receive messages sent to this group</div>
      </DialogBox>
    );
  }

  let contentBody;
  if (contentToShow === 'members') {
    contentBody = (
      <List
        backLink={`/group/chat/${params.id}`}
        dialogTitle={dialogTitle}
        columnNames={columnNames}
        title={groupData?.label}
        listItem="waGroupContact"
        listItemName="waGroupContact"
        searchParameter={['term']}
        filters={{ waGroupId: params.id }}
        button={{ show: false, label: '' }}
        pageLink="waGroupsContact"
        additionalAction={additionalActions}
        restrictedAction={restrictedAction}
        listIcon={collectionIcon}
        editSupport={false}
        showActions={true}
        dialogMessage={dialogMessage}
        {...queries}
        {...columnAttributes}
        showSearch={false}
        showHeader={false}
        customStyles={styles.Table}
      />
    );
  } else {
    contentBody = (
      <ContactDescription
        customStyles={styles.BackGround}
        fields={groupData?.fields}
        collections={groupData?.groups}
        groups
      />
    );
  }

  const drawer = (
    <div className={styles.Drawer}>
      <div data-testid="profileHeader" className={styles.GroupHeader}>
        <AvatarDisplay name={groupData?.label} />

        <div className={styles.GroupHeaderTitle}>{groupData?.label}</div>
      </div>
      <div className={styles.GroupHeaderElements}>
        {list.map((data: any, index: number) => {
          return (
            <div
              key={index}
              onClick={() => setContentToShow(data.section)}
              className={`${styles.Tab} ${contentToShow === data.section ? styles.ActiveTab : ''}`}
            >
              {data.name}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (groupDataLoading) {
    return <Loading />;
  }

  return (
    <>
      <Heading formTitle={t('Group Details')} backLink={`/group/chat/${params.id}`} showHeaderHelp={false} />

      <div className={styles.Container}>
        {drawer}
        <div className={styles.RightContainer}>{contentBody}</div>
      </div>
      {dialog}
    </>
  );
};

export default GroupDetails;
