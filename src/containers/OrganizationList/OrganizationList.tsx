import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { OutlinedInput } from '@mui/material';
import { useMutation } from '@apollo/client';

import { GET_ORGANIZATION_COUNT, FILTER_ORGANIZATIONS } from 'graphql/queries/Organization';
import {
  DELETE_INACTIVE_ORGANIZATIONS,
  UPDATE_ORGANIZATION_STATUS,
} from 'graphql/mutations/Organization';
import { ReactComponent as OrganisationIcon } from 'assets/images/icons/Organisation.svg';
import { ReactComponent as ExtensionIcon } from 'assets/images/icons/extension.svg';
import { ReactComponent as CustomerDetailsIcon } from 'assets/images/icons/customer_details.svg';
import { setNotification } from 'common/notification';
import { List } from 'containers/List/List';
import { Extensions } from 'containers/Extensions/Extensions';
import { OrganizationCustomer } from 'containers/Organization/OrganizationCustomer/OrganizationCustomer';
import { Dropdown } from 'components/UI/Form/Dropdown/Dropdown';
import styles from './OrganizationList.module.css';

export interface OrganizationListProps {
  openExtensionModal?: boolean;
  openCustomerModal?: boolean;
}

const queries = {
  countQuery: GET_ORGANIZATION_COUNT,
  filterItemsQuery: FILTER_ORGANIZATIONS,
  deleteItemQuery: DELETE_INACTIVE_ORGANIZATIONS,
};

export const OrganizationList = ({
  openExtensionModal,
  openCustomerModal,
}: OrganizationListProps) => {
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
        <span className={styles.SubLabelText}>{moment(insertedAt).format('DD MMM YYYY')}</span>
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

  const listIcon = <OrganisationIcon className={styles.OrgIcon} />;
  const extensionIcon = <ExtensionIcon className={styles.ExtensionIcon} />;

  const customerDetailsIcon = <CustomerDetailsIcon />;

  const [deleteInActiveOrg] = useMutation(DELETE_INACTIVE_ORGANIZATIONS);

  const handleDeleteInActiveOrg = ({ payload, refetch, setDeleteItemID }: any) => {
    deleteInActiveOrg({ variables: payload, refetchQueries: refetch });
    // Setting delete item id to null to prevent showing dialogue again
    setDeleteItemID(null);
    setNotification('Organization deleted successfully');
  };

  const deleteDialogue = (id: any, name: any) => {
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

    const isConfirmed = orgName === name;
    const payload = {
      isConfirmed,
      deleteOrganizationID: id,
    };
    return {
      component,
      handleOkCallback: (val: any) => handleDeleteInActiveOrg({ payload, ...val }),
      isConfirmed,
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
