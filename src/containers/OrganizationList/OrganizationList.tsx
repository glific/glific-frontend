import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { IconButton, OutlinedInput } from '@material-ui/core';
import { useMutation, useApolloClient } from '@apollo/client';

import styles from './OrganizationList.module.css';
import { GET_ORGANIZATION_COUNT, FILTER_ORGANIZATIONS } from '../../graphql/queries/Organization';
import {
  DELETE_INACTIVE_ORGANIZATIONS,
  UPDATE_ORGANIZATION_STATUS,
} from '../../graphql/mutations/Organization';
import { List } from '../List/List';
import { setVariables } from '../../common/constants';
import { Tooltip } from '../../components/UI/Tooltip/Tooltip';
import { ReactComponent as OrganisationIcon } from '../../assets/images/icons/Organisation.svg';
import { ReactComponent as ActivateIcon } from '../../assets/images/icons/Activate.svg';
import { ReactComponent as UnblockIcon } from '../../assets/images/icons/Unblock.svg';
import { ReactComponent as RemoveIcon } from '../../assets/images/icons/Remove.svg';
import { ReactComponent as ApprovedIcon } from '../../assets/images/icons/Template/Approved.svg';
import { ReactComponent as ExtensionIcon } from '../../assets/images/icons/extension.svg';
import { ReactComponent as CustomerDetailsIcon } from '../../assets/images/icons/customer_details.svg';
import { setNotification } from '../../common/notification';
import { Extensions } from '../Extensions/Extensions';
import { OrganizationCustomer } from '../Organization/OrganizationCustomer/OrganizationCustomer';

export interface OrganizationListProps {
  match: any;
  openExtensionModal?: boolean;
  openCustomerModal?: boolean;
}

const queries = {
  countQuery: GET_ORGANIZATION_COUNT,
  filterItemsQuery: FILTER_ORGANIZATIONS,
  deleteItemQuery: DELETE_INACTIVE_ORGANIZATIONS,
};

export const OrganizationList: React.SFC<OrganizationListProps> = ({
  match,
  openExtensionModal,
  openCustomerModal,
}) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [orgName, setOrgName] = useState('');
  const history = useHistory();

  const columnNames = ['NAME', 'IS APPROVED', 'IS ACTIVE', 'ACTIONS'];

  const getName = (label: string, insertedAt: any) => (
    <div className={styles.LabelContainer}>
      <p className={styles.LabelText}>
        {label}
        <br />
        <span className={styles.SubLabelText}>{moment(insertedAt).format('DD MMM YYYY')}</span>
      </p>
    </div>
  );

  const getStatus = (status: boolean, option: string) => {
    let text: any;

    switch (option) {
      case 'active':
        text = status ? 'Active' : 'Inactive';
        break;
      case 'approve':
        text = status ? 'Approved' : 'Pending';
        break;
      default:
        break;
    }

    return (
      <div>
        <p className={styles.StatusText}>{text}</p>
      </div>
    );
  };

  const columnStyles: any = [styles.Label, styles.Status, styles.Status, styles.Actions];

  const getColumns = ({ name, isActive, isApproved, insertedAt }: any) => ({
    name: getName(name, insertedAt),
    isApproved: getStatus(isApproved, 'approve'),
    isActive: getStatus(isActive, 'active'),
  });

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const listIcon = <OrganisationIcon className={styles.OrgIcon} />;
  const approveIcon = <UnblockIcon />;
  const activeIcon = <ActivateIcon />;
  const extensionIcon = <ExtensionIcon />;
  const customerDetailsIcon = <CustomerDetailsIcon />;
  const [updateOrganizationStatus] = useMutation(UPDATE_ORGANIZATION_STATUS);
  const [deleteInActiveOrg] = useMutation(DELETE_INACTIVE_ORGANIZATIONS);

  const handleOrganizationStatus = (id: any, payload: any, refetch: any) => {
    const variables = {
      updateOrganizationId: id,
      ...payload,
    };
    updateOrganizationStatus({ variables, refetchQueries: refetch });
    setNotification(client, 'Organization updated successfully');
  };

  const handleDeleteInActiveOrg = ({ payload, refetch, setDeleteItemID }: any) => {
    deleteInActiveOrg({ variables: payload, refetchQueries: refetch });
    // Setting delete item id to null to prevent showing dialogue again
    setDeleteItemID(null);
    setNotification(client, 'Organization deleted successfully');
  };

  const activateButton = (listItems: any, action: any, key: number, refetch: any) => {
    const { isApproved, isActive } = listItems;

    /**
     * Default icon and labels for activate button
     */
    const iconLabel = isActive ? 'Deactivate organization' : 'Activate organization';
    const icon = isActive ? <RemoveIcon /> : action.icon;

    return (
      <IconButton
        color="default"
        data-testid="additionalButton"
        className={styles.additonalButton}
        id="additionalButton-icon"
        onClick={() =>
          handleOrganizationStatus(listItems.id, { isActive: !isActive, isApproved }, refetch)
        }
        key={key}
      >
        <Tooltip title={iconLabel} placement="top" key={key}>
          {icon}
        </Tooltip>
      </IconButton>
    );
  };

  const approveButton = (listItems: any, action: any, key: number, refetch: any) => {
    const { isApproved, isActive } = listItems;

    const icon = isApproved ? <ApprovedIcon /> : action.icon;
    const iconLabel = isApproved ? 'Unapprove organization' : 'Approve organization';

    return (
      <IconButton
        color="default"
        data-testid="additionalButton"
        className={styles.additonalButton}
        id="additionalButton-icon"
        key={key}
        onClick={() =>
          handleOrganizationStatus(listItems.id, { isApproved: !isApproved, isActive }, refetch)
        }
      >
        <Tooltip title={iconLabel} placement="top" key={key}>
          {icon}
        </Tooltip>
      </IconButton>
    );
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
    history.push({ pathname: `/organizations/${id}/extensions` });
  };

  const addCustomer = (id: any) => {
    history.push({ pathname: `/organizations/${id}/customer` });
  };

  const dialogMessage = deleteDialogue;

  const additionalActions = [
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
    {
      icon: approveIcon,
      parameter: 'id',
      label: t('Approve'),
      button: approveButton,
    },
    {
      icon: activeIcon,
      parameter: 'id',
      label: t('Activate'),
      button: activateButton,
    },
  ];
  const addNewButton = { show: false, label: 'Add New' };
  const restrictedAction = () => ({ delete: false, edit: false });

  return (
    <>
      <List
        title={t('Organizations')}
        listItem="organizations"
        listItemName="organization"
        pageLink="organization"
        listIcon={listIcon}
        dialogMessage={dialogMessage}
        refetchQueries={{
          query: FILTER_ORGANIZATIONS,
          variables: setVariables(),
        }}
        additionalAction={additionalActions}
        button={addNewButton}
        restrictedAction={restrictedAction}
        searchParameter="name"
        editSupport={false}
        {...queries}
        {...columnAttributes}
      />
      <Extensions openDialog={!!openExtensionModal} match={match} />
      <OrganizationCustomer openDialog={!!openCustomerModal} match={match} />
    </>
  );
};

export default OrganizationList;
