import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GET_ORGANIZATION_COUNT, FILTER_ORGANIZATIONS } from 'graphql/queries/Organization';

import { ReactComponent as CollectionIcon } from 'assets/images/icons/Collection/Dark.svg';
import { ReactComponent as UploadIcon } from 'assets/images/icons/Upload/Dark.svg';

import { List } from 'containers/List/List';
import styles from './SuperAdminContactManagement.module.css';
import UploadContactsDialog from '../UploadContactsDialog/UploadContactsDialog';

const queries = {
  countQuery: GET_ORGANIZATION_COUNT,
  filterItemsQuery: FILTER_ORGANIZATIONS,
  deleteItemQuery: null,
};

export const listIcon = <CollectionIcon className={styles.OrgIcon} />;
const extensionIcon = <UploadIcon className={styles.UploadIcon} />;

export const SuperAdminContactManagement = () => {
  const { t } = useTranslation();

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [organizationDetails, setOrganizationDetails] = useState({});

  let dialog;

  if (showUploadDialog) {
    dialog = (
      <UploadContactsDialog
        organizationDetails={organizationDetails}
        setDialog={setShowUploadDialog}
      />
    );
  }

  const columnNames = [{ name: 'name', label: t('Name') }, { label: t('Actions') }];

  const getName = (label: string) => (
    <div className={styles.LabelContainer}>
      <p className={styles.LabelText}>{label}</p>
    </div>
  );

  const columnStyles: any = [styles.Label, styles.Actions];

  const getColumns = ({ name }: any) => ({
    name: getName(name),
  });

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const uploadContacts = (_: any, details: any) => {
    setOrganizationDetails(details);
    setShowUploadDialog(true);
  };

  const restrictedAction = () => ({ delete: false, edit: false });

  const additionalActions = () => [
    {
      icon: extensionIcon,
      parameter: 'id',
      label: t('Upload contacts'),
      dialog: uploadContacts,
    },
  ];
  const addNewButton = { show: false, label: 'Add New' };

  return (
    <>
      {dialog}
      <List
        title={t('Contact management')}
        listItem="organizations"
        listItemName="organization"
        pageLink="organization"
        listIcon={listIcon}
        restrictedAction={restrictedAction}
        additionalAction={additionalActions}
        button={addNewButton}
        searchParameter={['name']}
        editSupport={false}
        {...queries}
        {...columnAttributes}
      />
    </>
  );
};

export default SuperAdminContactManagement;
