import { useTranslation } from 'react-i18next';
import { List } from 'containers/List/List';
import { ReactComponent as RoleIcon } from 'assets/images/icons/Role/Role.svg';
import { COUNT_ROLES, FILTER_ROLES } from 'graphql/queries/Role';
import { DELETE_ROLE } from 'graphql/mutations/Roles';
import styles from './RoleList.module.css';
import { ReactComponent as AddIcon } from 'assets/images/add.svg';

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

  const addIcon = <AddIcon className={styles.AddIcon} />;

  const helpData = {
    heading:
      'Glific also allows you to create specific roles to be assigned to your staff members besides the built-in roles. This feature is disabled by default for all NGOs, but could be enabled on demand. This feature allows you to create specific roles for your staff members like Teacher, Admin, Content Creator etc.',
    body: <></>,
    link: 'https://glific.github.io/docs/docs/Product%20Features/Others/Staff%20Management%20&%20Role%20Management',
  };

  return (
    <List
      helpData={helpData}
      title={t('Role Management')}
      listItem="accessRoles"
      listItemName="role"
      pageLink="role"
      listIcon={roleIcon}
      {...queries}
      {...columnAttributes}
      button={{ show: true, label: t('Create Role'), symbol: addIcon }}
    />
  );
};

export default RoleList;
