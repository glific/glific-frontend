import { Instructions } from './Instructions/Instructions';
import styles from './ContactManagement.module.css';
import { Heading } from 'components/UI/Heading/Heading';
import { useState } from 'react';
import UploadContactsDialog from './UploadContactsDialog/UploadContactsDialog';
import { Button } from 'components/UI/Form/Button/Button';
import AdminContactManagement from './AdminContactManagement/AdminContactManagement';
import { contactVariablesInfo } from 'common/HelpData';

export const ContactManagement = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  let dialog;

  if (showUploadDialog) {
    dialog = <UploadContactsDialog setDialog={setShowUploadDialog} />;
  }

  return (
    <>
      <Heading
        formTitle="Contact Management"
        showHeaderHelp={false}
        helpData={contactVariablesInfo}
      />
      <div className={styles.MainContainer}>
        <div className={styles.Container}>
          <div>
            <h2>Import contacts</h2>
            <Instructions />
          </div>

          <div className={styles.Buttons}>
            <Button
              data-testid="uploadContactsBtn"
              variant="contained"
              onClick={() => setShowUploadDialog(true)}
            >
              Continue
            </Button>
          </div>
        </div>

        <AdminContactManagement />
      </div>

      {dialog}
    </>
  );
};

export default ContactManagement;
