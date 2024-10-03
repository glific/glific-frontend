import dayjs from 'dayjs';

import { SHORT_DATE_TIME_FORMAT } from 'common/constants';

import styles from './StorageDetails.module.css';

interface StorageProps {
  storage: any;
}

export const StorageDetails = ({ storage }: StorageProps) => {
  return (
    <div>
      <h5 className={styles.Heading}>Details</h5>
      <div className={styles.Storage}>
        <div className={styles.Details}>
          <span className={styles.Title}>ID</span>
          <span className={styles.Value}>{storage?.vectorStoreId}</span>
        </div>

        <div className={styles.Details}>
          <span className={styles.Title}>Size</span>
          <span className={styles.Value}>{storage?.size}</span>
        </div>

        <div className={styles.Details}>
          <span className={styles.Title}>Created At</span>
          <span className={styles.Value}>
            {dayjs(storage?.insertedAt).format(SHORT_DATE_TIME_FORMAT)}
          </span>
        </div>
      </div>
    </div>
  );
};
