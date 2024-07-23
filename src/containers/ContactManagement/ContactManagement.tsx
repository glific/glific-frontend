import { Instructions } from './Instructions/Instructions';
import styles from './ContactManagement.module.css';
import AdminContactManagement from './AdminContactManagement/AdminContactManagement';
import { Heading } from 'components/UI/Heading/Heading';
import { useState } from 'react';
import UploadContactsDialog from './UploadContactsDialog/UploadContactsDialog';
import { Button } from 'components/UI/Form/Button/Button';
import SuperAdminContactManagement from './SuperAdminContactManagement/SuperAdminContactManagement';
import { getUserRole } from 'context/role';
import { UPLOAD_CONTACTS_SAMPLE } from 'config';

export const ContactManagement = () => {
  const role = getUserRole();

  console.log(role);

  const [showUploadDialog, setShowUploadDialog] = useState(false);

  let dialog;

  if (showUploadDialog) {
    dialog = <UploadContactsDialog setDialog={setShowUploadDialog} />;
  }

  return (
    <>
      <Heading formTitle="Contact Management" showHeaderHelp={false} />
      <div className={styles.MainContainer}>
        <div className={styles.Container}>
          <Instructions />

          <div className={styles.Buttons}>
            <Button variant="contained" onClick={() => setShowUploadDialog(true)}>
              Upload Contacts
            </Button>
            <a href={UPLOAD_CONTACTS_SAMPLE}>Download Sample</a>
          </div>
        </div>
      </div>

      {dialog}
    </>
  );
};

export default ContactManagement;
