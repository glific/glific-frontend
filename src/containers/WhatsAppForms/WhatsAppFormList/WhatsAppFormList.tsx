import HelpIcon from 'components/UI/HelpIcon/HelpIcon';
import styles from '../../List/List.module.css';
import { whatsappFormsInfo } from 'common/HelpData';
import { Button } from 'components/UI/Form/Button/Button';
import { useNavigate } from 'react-router';

export const WhatsAppFormList = () => {
  const navigate = useNavigate();
  return (
    <div>
      {/* TODO: Add <List /> Component and remove this header component*/}
      <div className={styles.Header} data-testid="listHeader">
        <div>
          <div className={styles.Title}>
            <div className={styles.TitleText}> WhatsApp Forms</div>
            <HelpIcon helpData={whatsappFormsInfo} />
          </div>
        </div>
        <div>
          <div className={styles.ButtonGroup}>
            <Button variant="contained" color="primary" onClick={() => navigate('/whatsapp-forms/add')}>
              Create New Form
            </Button>
          </div>
        </div>
      </div>
      WhatsApp Forms List
    </div>
  );
};

export default WhatsAppFormList;
