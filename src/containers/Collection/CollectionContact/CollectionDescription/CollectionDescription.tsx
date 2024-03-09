import { useTranslation } from 'react-i18next';

import { CollectionInformation } from 'containers/Collection/CollectionInformation/CollectionInformation';
import styles from './CollectionDescription.module.css';

export interface CollectionDescriptionProps {
  users: Array<any>;
  collectionId?: string;
}

export const CollectionDescription = ({ users = [], collectionId }: CollectionDescriptionProps) => {
  const { t } = useTranslation();

  const userList = (
    <div className={styles.UserList}>
      {users.length ? users.map((user: any) => <li key={user.id}>{user.name}</li>) : <li>None</li>}
    </div>
  );
  return (
    <div className={styles.DescriptionContainer} data-testid="collectionDescription">
      <div className={styles.CollectionInformation}>
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
