import { Heading } from 'components/UI/Heading/Heading';
import styles from './Configure.module.css';
import { FormBuilder } from './FormBuilder/FormBuilder';
import { Preview } from './Preview/Preview';

export const Configure = () => {
  return (
    <>
      <Heading formTitle="Configure WhatsApp Form" backLink="/whatsapp-forms" />
      <div className={styles.configureContainer}>
        <div className={styles.flowBuilder}>
          <FormBuilder />
        </div>
        <div className={styles.preview}>
          <Preview />
        </div>
      </div>
    </>
  );
};

export default Configure;
