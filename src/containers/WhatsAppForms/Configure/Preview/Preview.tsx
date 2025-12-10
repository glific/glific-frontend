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
                {/* <svg width="40" height="40" viewBox="0 0 40 40" fill="#ddd">
                  <circle cx="20" cy="20" r="20" />
                  <path
                    d="M20 20c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6zm0 3c-4 0-12 2-12 6v2h24v-2c0-4-8-6-12-6z"
                    fill="#999"
                  />
                </svg> */}

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
