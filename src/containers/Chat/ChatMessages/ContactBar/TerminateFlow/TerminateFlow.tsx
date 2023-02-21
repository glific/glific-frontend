import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { useMutation } from '@apollo/client';
import { setNotification } from 'common/notification';
import { TERMINATE_FLOW } from 'graphql/queries/Flow';
import styles from './TerminateFlow.module.css';

export interface TerminateFlowProps {
  contactId: String | undefined;
  setDialog: any;
}

export const TerminateFlow = ({ contactId, setDialog }: TerminateFlowProps) => {
  const [terminateFlow] = useMutation(TERMINATE_FLOW, {
    onCompleted: ({ terminateContactFlows }) => {
      if (terminateContactFlows.success) {
        setNotification('Flow terminated successfully');
      } else if (terminateContactFlows.errors) {
        setNotification(terminateContactFlows.errors[0].message, 'warning');
      }
    },
  });

  const handleTerminateFlow = () => {
    terminateFlow({ variables: { contactId } });
    setDialog(false);
  };

  return (
    <DialogBox
      title="Terminate flows!"
      alignButtons="center"
      buttonOk="YES, TERMINATE"
      buttonCancel="NO, CANCEL"
      additionalTitleStyles={styles.Title}
      colorOk="warning"
      handleOk={handleTerminateFlow}
      handleCancel={() => {
        setDialog(false);
      }}
    >
      <div className={styles.Dialog}>
        All active flows for the contact will be stopped. They can initiate a flow via keyword or
        you will need to do it manually.
      </div>
    </DialogBox>
  );
};
