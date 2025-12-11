import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import styles from './Preview.module.css';

export const Preview = () => {
  return (
    <div className={styles.previewContainer}>
      <div className={styles.previewHeader}>
        <h3>Preview</h3>
      </div>
      <div className={styles.phoneFrame}>
        <div className={styles.phoneScreen}>
          <div className={styles.whatsappHeader}>
            <div className={styles.backButton}>
              <ArrowBackIosIcon />
            </div>
            <div className={styles.chatInfo}>
              <div className={styles.avatar}>
                <PersonIcon fontSize="large" />
              </div>
              <div className={styles.chatName}>
                <span className={styles.name}>Business Name</span>
                <span className={styles.status}>Online</span>
              </div>
            </div>
            <div className={styles.headerActions}>
              <MoreVertIcon />
            </div>
          </div>
          <div className={styles.chatContent}></div>
        </div>
      </div>
    </div>
  );
};
