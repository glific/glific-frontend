import { useTranslation } from 'react-i18next';
import { List } from 'containers/List/List';
import RoleIcon from 'assets/images/icons/Role/Role.svg?react';
import { COUNT_ROLES, FILTER_ROLES } from 'graphql/queries/Role';
import { DELETE_ROLE } from 'graphql/mutations/Roles';
import styles from './RoleList.module.css';
import { roleInfo } from 'common/HelpData';

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

export const RoleList = () => {
  const { t } = useTranslation();

  const getColumns = ({ description, label }: any) => ({
    label: getLabel(label),
    description: getDescription(description),
  });

  const columnNames = [
    { name: 'label', label: t('Label') },
    { name: 'description', label: t('Description') },
    { label: t('Actions') },
  ];

  const columnAttributes = {
    columnNames,
    columns: getColumns,
    columnStyles,
  };

  return (
    <List
      helpData={roleInfo}
      title={t('Role Management')}
      listItem="accessRoles"
      listItemName="role"
      pageLink="role"
      listIcon={roleIcon}
      {...queries}
      {...columnAttributes}
      button={{ show: true, label: t('Create') }}
    />
  );
};

export default RoleList;
