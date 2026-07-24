import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { OutlinedInput } from '@mui/material';
import { useMutation } from '@apollo/client';

import { GET_ORGANIZATION_COUNT, FILTER_ORGANIZATIONS } from 'graphql/queries/Organization';
import { DELETE_ORGANIZATION, UPDATE_ORGANIZATION_STATUS } from 'graphql/mutations/Organization';
import OrganizationIcon from 'assets/images/icons/Organization.svg?react';
import ExtensionIcon from 'assets/images/icons/extension.svg?react';
import CustomerDetailsIcon from 'assets/images/icons/customer_details.svg?react';
import { setNotification, setErrorMessage } from 'common/notification';
import { List } from 'containers/List/List';
import { Extensions } from 'containers/Extensions/Extensions';
import { OrganizationCustomer } from 'containers/Organization/OrganizationCustomer/OrganizationCustomer';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import styles from './OrganizationList.module.css';
import { DATE_FORMAT_WITH_MONTH } from 'common/constants';

export interface OrganizationListProps {
  openExtensionModal?: boolean;
  openCustomerModal?: boolean;
}

const queries = {
  countQuery: GET_ORGANIZATION_COUNT,
  filterItemsQuery: FILTER_ORGANIZATIONS,
  deleteItemQuery: DELETE_ORGANIZATION,
};

export const OrganizationList = ({ openExtensionModal, openCustomerModal }: OrganizationListProps) => {
  const { t } = useTranslation();

  const [orgName, setOrgName] = useState('');
  const navigate = useNavigate();

  const columnNames = [
    { name: 'name', label: t('Name') },
    { name: 'status', label: t('Status') },
    { name: 'id', label: t('Org Id') },
    { label: t('Actions') },
  ];

  const getOrgId = (id: string) => <p className={styles.OrgIdContainer}>{id}</p>;

  const getName = (label: string, insertedAt: any) => (
    <div className={styles.LabelContainer}>
      <p className={styles.LabelText}>
        {label}
        <br />
        <span className={styles.SubLabelText}>{dayjs(insertedAt).format(DATE_FORMAT_WITH_MONTH)}</span>
      </p>
    </div>
  );

  const [updateOrganizationStatus] = useMutation(UPDATE_ORGANIZATION_STATUS, {
    onCompleted: () => {
      setNotification('Organization updated successfully');
    },
  });

  const getStatus = (id: any, status: string) => {
    const options = [
      { id: 'INACTIVE', label: <div className={styles.Inactive}>Inactive</div> },
      { id: 'APPROVED', label: 'Approved' },
      { id: 'ACTIVE', label: 'Active' },
      { id: 'FORCED_SUSPENSION', label: 'Forced Suspension' },
      { id: 'SUSPENDED', label: 'Suspended' },
      { id: 'READY_TO_DELETE', label: <div className={styles.Delete}>Ready to delete</div> },
    ];

    const statusField = {
      onChange: (event: any) => {
        updateOrganizationStatus({
          variables: {
            updateOrganizationId: id,
            status: event.target.value,
          },
        });
      },
      value: status,
      style: { width: '187px' },
    };
    return <Dropdown options={options} placeholder="" field={statusField} />;
  };

  const columnStyles: any = [styles.Label, styles.Status, styles.OrgId, styles.Actions];

  const getColumns = ({ id, name, insertedAt, status }: any) => ({
    name: getName(name, insertedAt),
    isApproves: getStatus(id, status),
    orgId: getOrgId(id),
  });

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const listIcon = <OrganizationIcon className={styles.OrgIcon} />;
  const extensionIcon = <ExtensionIcon className={styles.ExtensionIcon} />;

  const customerDetailsIcon = <CustomerDetailsIcon />;

  const [deleteOrganization] = useMutation(DELETE_ORGANIZATION);
  // Separate instance without the success toast used by the status dropdown above.
  const [setReadyToDelete] = useMutation(UPDATE_ORGANIZATION_STATUS);

  const handleDeleteOrganization = async ({ id, refetch, setDeleteItemID }: any) => {
    // Setting delete item id to null to prevent showing dialogue again
    setDeleteItemID(null);
    try {
      // The async deletion worker only accepts orgs in `ready_to_delete` status,
      // so make sure the org is in that status before firing the mutation.
      await setReadyToDelete({
        variables: { updateOrganizationId: id, status: 'READY_TO_DELETE' },
      });
      // Fire-and-forget: a background job performs the deletion and reports
      // success/failure through in-app (Organization) notifications.
      await deleteOrganization({ variables: { id } });
      setNotification('Organization deletion has been initiated. You will be notified once it is complete.');
      if (refetch) {
        refetch();
      }
    } catch (error) {
      setErrorMessage(error);
    }
  };

  const deleteDialogue = ({ deleteItemID, deleteItemName, refetch, setDeleteItemID }: any) => {
    const component = (
      <div>
        <p className={styles.DialogSubText}>
          This action cannot be undone. Please enter the name of organization to proceed
        </p>
        <OutlinedInput
          fullWidth
          placeholder="Organization name"
          onChange={(event: any) => setOrgName(event.target.value)}
          className={styles.DialogSubInput}
        />
      </div>
    );
    const isConfirmed = orgName === deleteItemName;
    return {
      component,
      props: {
        disableOk: !isConfirmed,
        handleOk: () => handleDeleteOrganization({ id: deleteItemID, refetch, setDeleteItemID }),
      },
    };
  };

  const addExtension = (id: any) => {
    navigate(`/organizations/${id}/extensions`);
  };

  const addCustomer = (id: any) => {
    navigate(`/organizations/${id}/customer`);
  };

  const dialogMessage = deleteDialogue;

  const additionalActions = () => [
    {
      icon: extensionIcon,
      parameter: 'id',
      label: t('Extension code'),
      dialog: addExtension,
    },
    {
      icon: customerDetailsIcon,
      parameter: 'id',
      label: t('Add/View Customer'),
      dialog: addCustomer,
    },
  ];
  const addNewButton = { show: false, label: 'Add New' };
  const restrictedAction = (listItem: any) => {
    if (listItem.status === 'READY_TO_DELETE') {
      return { delete: true, edit: false };
    }
    return { delete: false, edit: false };
  };

  return (
    <>
      <List
        title={t('Organizations')}
        listItem="organizations"
        listItemName="organization"
        pageLink="organization"
        listIcon={listIcon}
        dialogMessage={dialogMessage}
        additionalAction={additionalActions}
        button={addNewButton}
        restrictedAction={restrictedAction}
        searchParameter={['name']}
        editSupport={false}
        {...queries}
        {...columnAttributes}
      />
      <Extensions openDialog={!!openExtensionModal} />
      <OrganizationCustomer openDialog={!!openCustomerModal} />
    </>
  );
};

export default OrganizationList;
