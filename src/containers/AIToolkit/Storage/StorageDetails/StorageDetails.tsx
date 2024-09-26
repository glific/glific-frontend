import styles from './StorageDetails.module.css';

interface StorageProps {
  storage: { id: string; size: number; last_active: string; inserted_at: string };
}

export const StorageDetails = ({ storage }: StorageProps) => {
  return (
    <>
      <h5 className={styles.Heading}>Details</h5>
      <div className={styles.Storage}>
        <div className={styles.Details}>
          <span className={styles.Title}>ID</span>
          <span className={styles.Value}>{storage.id}</span>
        </div>

        <div className={styles.Details}>
          <span className={styles.Title}>Size</span>
          <span className={styles.Value}>{storage.size}</span>
        </div>

        <div className={styles.Details}>
          <span className={styles.Title}>Last Active At</span>
          <span className={styles.Value}>{storage.last_active}</span>
        </div>

        <div className={styles.Details}>
          <span className={styles.Title}>Created At</span>
          <span className={styles.Value}>{storage.inserted_at}</span>
        </div>
      </div>
    </>
  );
};
