import React from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import styles from './OrganizationList.module.css';
import { GET_ORGANIZATION_COUNT, FILTER_ORGANIZATIONS } from '../../graphql/queries/Organization';
import {
  DELETE_INACTIVE_ORGANIZATIONS,
  UPDATE_ORGANIZATION_STATUS,
} from '../../graphql/mutations/Organization';

import { List } from '../List/List';
import { setVariables } from '../../common/constants';
import { ReactComponent as OrganisationIcon } from '../../assets/images/icons/Organisation.svg';
import { ReactComponent as ActivateIcon } from '../../assets/images/icons/Activate.svg';
import { ReactComponent as UnblockIcon } from '../../assets/images/icons/Unblock.svg';

export interface OrganizationListProps {}

const queries = {
  countQuery: GET_ORGANIZATION_COUNT,
  filterItemsQuery: FILTER_ORGANIZATIONS,
  deleteItemQuery: DELETE_INACTIVE_ORGANIZATIONS,
  updateStatusQuery: UPDATE_ORGANIZATION_STATUS,
};

export const OrganizationList: React.SFC<OrganizationListProps> = () => {
  const { t } = useTranslation();

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

  /**
   * Add custom component for delete with input text
   */
  const deleteDialogue = ({ children }: { children: any }) => <div>{children}</div>;

  const dialogMessage = deleteDialogue;

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  const listIcon = <OrganisationIcon className={styles.OrgIcon} />;
  const approveIcon = <UnblockIcon />;
  const activeIcon = <ActivateIcon />;

  const additionalActions = [
    {
      icon: approveIcon,
      parameter: 'id',
      label: t('Approve'),
      other: 'approve',
    },
    {
      icon: activeIcon,
      parameter: 'id',
      label: t('Activate'),
      other: 'active',
    },
  ];

  const addNewButton = { show: false, label: 'Add New' };
  const restrictedAction = () => ({ delete: false, edit: false });

  return (
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
  );
};

export default OrganizationList;
