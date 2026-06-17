import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import CollectionIcon from 'assets/images/icons/Collection/Dark.svg?react';
import DeleteIcon from 'assets/images/icons/Delete/Red.svg?react';
import { setVariables } from 'common/constants';
import { setNotification } from 'common/notification';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { Heading } from 'components/UI/Heading/Heading';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { AvatarDisplay } from 'components/UI/AvatarDisplay/AvatarDisplay';
import { Button } from 'components/UI/Form/Button/Button';
import { Input } from 'components/UI/Form/Input/Input';
import { SearchDialogBox } from 'components/UI/SearchDialogBox/SearchDialogBox';
import { List } from 'containers/List/List';
import { ContactDescription } from 'containers/Profile/Contact/ContactDescription/ContactDescription';
import { UPDATE_WA_GROUP } from 'graphql/mutations/Group';
import { GET_CONTACTS_LIST } from 'graphql/queries/Contact';
import { COUNT_COUNTACTS_WA_GROUPS, GET_WA_GROUP, LIST_CONTACTS_WA_GROUPS } from 'graphql/queries/WaGroups';
import { PhonesPanel } from './PhonesPanel/PhonesPanel';
import styles from './GroupDetails.module.css';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';

export const GroupDetails = () => {
  const params = useParams();
  const { t } = useTranslation();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteVariables, setDeleteVariables] = useState<any>();
  const [contentToShow, setContentToShow] = useState('members');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showAddMembersDialog, setShowAddMembersDialog] = useState(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  const dialogTitle = 'Are you sure you want to remove this contact from the group?';
  const dialogMessage = 'The contact will no longer receive messages sent to this group';

  const columnNames = [{ label: t('Contact') }, { label: 'All WhatsApp Groups' }, { label: t('Actions') }];

  const list = [
    {
      name: t('Members'),
      section: 'members',
    },
    {
      name: t('Phones'),
      section: 'phones',
    },
    {
      name: t('Details'),
      section: 'details',
    },
  ];

  const [removeContact, { loading }] = useMutation(UPDATE_WA_GROUP, {
    refetchQueries: [
      { query: GET_WA_GROUP, variables: { waGroupId: params.id } },
      { query: LIST_CONTACTS_WA_GROUPS, variables: { filter: { waGroupId: params.id } } },
    ],
    onCompleted: (responseData) => {
      const errors = responseData?.updateWaGroup?.errors;
      if (errors?.length) {
        setNotification(
          errors
            .map((e: any) => e?.message)
            .filter(Boolean)
            .join('; '),
          'warning'
        );
        return;
      }
      setNotification('Removed Contact from Group', 'success');
      setShowDeleteDialog(false);
    },
    onError: () => {
      setNotification(t('Could not remove contact from the group'), 'warning');
    },
  });

  const [addMembers, { loading: addingMembers }] = useMutation(UPDATE_WA_GROUP, {
    refetchQueries: [
      { query: GET_WA_GROUP, variables: { waGroupId: params.id } },
      { query: LIST_CONTACTS_WA_GROUPS, variables: { filter: { waGroupId: params.id } } },
    ],
    onError: () => {
      setNotification(t('Could not add contacts to the group'), 'warning');
    },
  });

  const { data: memberSearchData, loading: memberSearchLoading } = useQuery(GET_CONTACTS_LIST, {
    variables: setVariables({ name: memberSearchTerm, excludeWaGroups: params.id }, 50),
    fetchPolicy: 'cache-and-network',
    skip: !showAddMembersDialog,
  });

  const memberSearchOptions =
    memberSearchData?.contacts?.map((c: any) => ({
      ...c,
      name: c.name || c.phone,
    })) || [];

  const handleAddMembers = async (selectedContactIds: any[]) => {
    if (!selectedContactIds.length) {
      setShowAddMembersDialog(false);
      return;
    }
    const { data: responseData } = await addMembers({
      variables: {
        input: {
          id: params.id,
          addContactIds: selectedContactIds,
        },
      },
    });
    const errors = responseData?.updateWaGroup?.errors;
    if (errors?.length) {
      setNotification(
        errors
          .map((e: any) => e?.message)
          .filter(Boolean)
          .join('; '),
        'warning'
      );
      return;
    }
    if (responseData?.updateWaGroup?.waGroup) {
      const added = selectedContactIds.length;
      setNotification(`${added} ${added === 1 ? 'contact' : 'contacts'} added`, 'success');
      setShowAddMembersDialog(false);
    }
  };

  const [renameGroup, { loading: renaming }] = useMutation(UPDATE_WA_GROUP, {
    refetchQueries: [{ query: GET_WA_GROUP, variables: { waGroupId: params.id } }],
    onCompleted: (responseData) => {
      const errors = responseData?.updateWaGroup?.errors;
      if (errors?.length) {
        setNotification(
          errors
            .map((e: any) => e?.message)
            .filter(Boolean)
            .join('; '),
          'warning'
        );
        return;
      }
      setNotification(t('Group renamed'), 'success');
      setShowRenameDialog(false);
    },
    onError: () => {
      setNotification(t('Could not rename group'), 'warning');
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
    deleteItemQuery: null,
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
      name: getName(contact, waGroup.primaryPhone?.phone, isAdmin),
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
    setDeleteVariables({ contactId: contact.id });
  };

  const handleRemoveContact = () => {
    removeContact({
      variables: {
        input: {
          id: params.id,
          removeContactId: deleteVariables?.contactId,
        },
      },
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

  if (showAddMembersDialog) {
    dialog = (
      <SearchDialogBox
        title={t('Add members to this group')}
        handleOk={handleAddMembers}
        handleCancel={() => setShowAddMembersDialog(false)}
        buttonOkLoading={addingMembers}
        disableOk={addingMembers}
        options={memberSearchOptions}
        optionLabel="name"
        additionalOptionLabel="phone"
        asyncSearch
        disableClearable
        selectedOptions={[]}
        fullWidth
        showTags={false}
        noOptionsText={memberSearchLoading ? t('Loading...') : t('No options available')}
        onChange={(value: any) => {
          if (typeof value === 'string') {
            setMemberSearchTerm(value);
          }
        }}
      />
    );
  }

  if (showRenameDialog) {
    const handleRename = (values: { subject: string }) => {
      renameGroup({
        variables: {
          input: {
            id: params.id,
            name: values.subject.trim(),
          },
        },
      });
    };

    dialog = (
      <Formik
        enableReinitialize
        validationSchema={Yup.object().shape({
          subject: Yup.string().required(t('Group name is required')).max(100, t('Name is too long')),
        })}
        initialValues={{ subject: groupData?.label || '' }}
        onSubmit={handleRename}
      >
        {({ submitForm }) => (
          <Form>
            <DialogBox
              title={t('Rename group')}
              titleAlign="left"
              buttonOk={t('Rename')}
              buttonCancel={t('Cancel')}
              alignButtons="right"
              buttonOkLoading={renaming}
              disableOk={renaming}
              skipCancel={renaming}
              handleOk={() => submitForm()}
              handleCancel={() => {
                if (!renaming) setShowRenameDialog(false);
              }}
              fullWidth
            >
              <Field
                name="subject"
                component={Input}
                type="text"
                inputLabel={t('New name')}
                placeholder={t('New name')}
                required
                helperText={t('The change is pushed to WhatsApp via the group’s admin phone.')}
              />
            </DialogBox>
          </Form>
        )}
      </Formik>
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
  } else if (contentToShow === 'phones') {
    contentBody = <PhonesPanel phones={groupData?.phones || []} waGroupId={params.id!} />;
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
        <div className={styles.GroupHeaderTop}>
          <AvatarDisplay name={groupData?.label} />
          <div className={styles.GroupHeaderTitle}>{groupData?.label}</div>
        </div>

        <div className={styles.HeaderActions}>
          <Button
            variant="outlined"
            color="primary"
            className={styles.HeaderActionButton}
            data-testid="renameGroup"
            onClick={() => setShowRenameDialog(true)}
          >
            {t('Rename')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            className={styles.HeaderActionButton}
            data-testid="addMembers"
            onClick={() => setShowAddMembersDialog(true)}
          >
            {t('Add members')}
          </Button>
        </div>
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
      <Heading formTitle={t('Group Details')} backLink={`/group/chat/${params.id}`} />

      <div className={styles.Container}>
        {drawer}
        <div className={styles.RightContainer}>{contentBody}</div>
      </div>
      {dialog}
    </>
  );
};

export default GroupDetails;
