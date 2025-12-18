import { useState } from 'react';
import { Heading } from 'components/UI/Heading/Heading';
import styles from './Configure.module.css';
import { FormBuilder } from './FormBuilder/FormBuilder';
import { Preview } from './Preview/Preview';
import { JSONViewer } from './JSONViewer/JSONViewer';
import { Screen } from './FormBuilder/FormBuilder.types';

export const Configure = () => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [showJSON, setShowJSON] = useState(false);

  const handleViewJSON = () => {
    setShowJSON(true);
  };

  return (
    <>
      <Heading
        formTitle="Configure WhatsApp Form"
        backLink="/whatsapp-forms"
        button={{
          show: true,
          label: 'View JSON',
          action: handleViewJSON,
        }}
      />
      <div className={styles.configureContainer}>
        <div className={styles.flowBuilder}>
          <FormBuilder onScreensChange={setScreens} />
        </div>
        <div className={styles.preview}>
          <Preview />
        </div>
      </div>

      {showJSON && <JSONViewer screens={screens} onClose={() => setShowJSON(false)} />}
    </>
  );
};

export default Configure;
