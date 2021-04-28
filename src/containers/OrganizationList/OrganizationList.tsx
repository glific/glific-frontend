import React from 'react';
import { useTranslation } from 'react-i18next';
import ApartmentOutlinedIcon from '@material-ui/icons/ApartmentOutlined';
import CheckIcon from '@material-ui/icons/Check';
import Brightness1Icon from '@material-ui/icons/Brightness1';

import styles from './OrganizationList.module.css';
import {
  GET_ORGANIZATION_COUNT,
  FILTER_ORGANIZATIONS,
  FILTER_ORGANIZATIONS_NAME,
} from '../../graphql/queries/Organization';
import {
  DELETE_INACTIVE_ORGANIZATIONS,
  UPDATE_ORGANIZATION_STATUS,
} from '../../graphql/mutations/Organization';
import { ReactComponent as PendingIcon } from '../../assets/images/icons/Template/Pending.svg';
import { ReactComponent as ApprovedIcon } from '../../assets/images/icons/Template/Approved.svg';
import { List } from '../List/List';
import { setVariables } from '../../common/constants';

export interface OrganizationListProps {}

const queries = {
  countQuery: GET_ORGANIZATION_COUNT,
  filterItemsQuery: FILTER_ORGANIZATIONS,
  deleteItemQuery: DELETE_INACTIVE_ORGANIZATIONS,
  updateStatusQuery: UPDATE_ORGANIZATION_STATUS,
};

export const OrganizationList: React.SFC<OrganizationListProps> = () => {
  const { t } = useTranslation();

  const columnNames = ['NAME', 'IS ACTIVE', 'IS_APPROVED', 'ACTIONS'];

  const getName = (label: string) => (
    <div className={styles.LabelContainer}>
      <p className={styles.LabelText} style={{ color: '#0C976D' }}>
        {label}
      </p>
    </div>
  );

  const getActiveStatus = (status: boolean) => {
    const statusValue = status ? <>{t('Active')}</> : <>{t('Inactive')}</>;

    return <span className={styles.Status}>{statusValue}</span>;
  };

  const getApprovedStatus = (status: boolean) => {
    const statusValue = status ? (
      <>
        <ApprovedIcon />
        {t('Approved')}
      </>
    ) : (
      <>
        <PendingIcon />
        {t('Pending')}
      </>
    );

    return <span className={styles.Status}>{statusValue}</span>;
  };

  const columnStyles: any = [styles.Label, styles.Status, styles.Status, styles.Actions];

  const getColumns = ({ name, isActive, isApproved }: any) => ({
    name: getName(name),
    isActive: getActiveStatus(isActive),
    isApproved: getApprovedStatus(isApproved),
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

  const listIcon = <ApartmentOutlinedIcon className={styles.TagIcon} />;
  const approveIcon = <CheckIcon className={styles.ApproveIcon} />;
  const activeIcon = <Brightness1Icon />;

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
        query: FILTER_ORGANIZATIONS_NAME,
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
