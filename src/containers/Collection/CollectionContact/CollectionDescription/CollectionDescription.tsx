import { useTranslation } from 'react-i18next';

import { CollectionInformation } from 'containers/Collection/CollectionInformation/CollectionInformation';
import styles from './CollectionDescription.module.css';

export interface CollectionDescriptionProps {
  users: Array<any>;
  description: string;
  collectionId?: string;
}

export const CollectionDescription = ({
  users = [],
  description,
  collectionId,
}: CollectionDescriptionProps) => {
  const { t } = useTranslation();

  const userList = (
    <div className={styles.UserList}>
      {users.map((user: any) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </div>
  );
  return (
    <div className={styles.DescriptionContainer} data-testid="collectionDescription">
      <p className={styles.Description}>{description}</p>
      <div className={styles.CollectionInformation}>
        <h2 className={styles.Title}>{t('Description')}</h2>
        <CollectionInformation collectionId={collectionId} staff={false} />
      </div>

      <div className={styles.StaffDivider} />
      <div className={styles.Assignees}>
        <div className={styles.TitleAssign}>{t('Assigned to staff')}</div>
        <div>{userList}</div>
      </div>
    </div>
  );
};
