import React from 'react';
import { useTranslation } from 'react-i18next';
import { List } from 'containers/List/List';
import { ReactComponent as RoleIcon } from 'assets/images/icons/Role/Role.svg';
import { COUNT_ROLES, FILTER_ROLES } from 'graphql/queries/Role';
import { DELETE_ROLE } from 'graphql/mutations/Roles';
import styles from './RoleList.module.css';

export interface RoleListProps {}

const getLabel = (text: string) => (
  <p className={`${styles.LabelText} ${styles.NameText}`}>{text}</p>
);

const getDescription = (description: string) => (
  <div className={styles.TableText}>{description}</div>
);

const columnStyles = [styles.Label, styles.Description, styles.Actions];
const roleIcon = <RoleIcon className={styles.RoleIcon} />;

const queries = {
  countQuery: COUNT_ROLES,
  filterItemsQuery: FILTER_ROLES,
  deleteItemQuery: DELETE_ROLE,
};

export const RoleList: React.SFC<RoleListProps> = () => {
  const { t } = useTranslation();

  const getColumns = ({ description, label }: any) => ({
    label: getLabel(label),
    description: getDescription(description),
  });

  const columnNames = ['LABEL', 'DESCRIPTION', 'ACTIONS'];

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  return (
    <List
      title={t('Role Management')}
      listItem="accessRoles"
      listItemName="role"
      pageLink="role"
      listIcon={roleIcon}
      {...queries}
      {...columnAttributes}
      button={{ show: true, label: t('+ Create Role') }}
    />
  );
};

export default RoleList;
