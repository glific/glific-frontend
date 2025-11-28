import { Instructions } from './Instructions/Instructions';
import styles from './ContactManagement.module.css';
import { Heading } from 'components/UI/Heading/Heading';
import { useState } from 'react';
import UploadContactsDialog from './UploadContactsDialog/UploadContactsDialog';
import { Button } from 'components/UI/Form/Button/Button';
import AdminContactManagement from './AdminContactManagement/AdminContactManagement';
import { contactVariablesInfo } from 'common/HelpData';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { useNavigate } from 'react-router';

export const ContactManagement = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const navigate = useNavigate();
  let dialog;
  let statusDialog;

  if (showUploadDialog) {
    dialog = <UploadContactsDialog setShowStatus={setShowStatus} setDialog={setShowUploadDialog} />;
  }

  if (showStatus) {
    statusDialog = (
      <DialogBox
        titleAlign="center"
        title={'Contact import is in progress.'}
        handleOk={() => {
          navigate('/notifications');
          setShowStatus(false);
          setShowUploadDialog(false);
        }}
        handleCancel={() => {
          setShowStatus(false);
          setShowUploadDialog(false);
        }}
        skipCancel
        buttonOk={'Go to notifications'}
        alignButtons="left"
      >
        <div className={styles.DialogContent}>Please check notifications to see the status of import.</div>
      </DialogBox>
    );
  }

  return (
    <>
      <Heading formTitle="Contact Management" helpData={contactVariablesInfo} />
      <div className={styles.MainContainer}>
        <div className={styles.Container}>
          <div>
            <h2>Import contacts</h2>
            <Instructions />
          </div>

          <div className={styles.Buttons}>
            <Button data-testid="uploadContactsBtn" variant="contained" onClick={() => setShowUploadDialog(true)}>
              Continue
            </Button>
          </div>
        </div>

        <AdminContactManagement setShowStatus={setShowStatus} />
      </div>

      {dialog}
      {statusDialog}
    </>
  );
};

export default ContactManagement;
