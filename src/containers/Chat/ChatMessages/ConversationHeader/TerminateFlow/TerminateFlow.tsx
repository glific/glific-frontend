import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { useMutation } from '@apollo/client';
import { setNotification } from 'common/notification';
import { TERMINATE_FLOW } from 'graphql/mutations/Flow';
import styles from './TerminateFlow.module.css';

export interface TerminateFlowProps {
  contactId: String | undefined;
  setDialog: any;
}

export const TerminateFlow = ({ contactId, setDialog }: TerminateFlowProps) => {
  const [terminateFlow] = useMutation(TERMINATE_FLOW);

  const handleTerminateFlow = async () => {
    setDialog(false);
    const { data } = await terminateFlow({ variables: { contactId } });
    const terminateContactFlows = data?.terminateContactFlows;
    if (terminateContactFlows?.success) {
      setNotification('Flow terminated successfully');
    } else if (terminateContactFlows?.errors) {
      setNotification(terminateContactFlows.errors[0].message, 'warning');
    }
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
        All active flows for the contact will be stopped. They can initiate a flow via keyword or you will need to do it
        manually.
      </div>
    </DialogBox>
  );
};
