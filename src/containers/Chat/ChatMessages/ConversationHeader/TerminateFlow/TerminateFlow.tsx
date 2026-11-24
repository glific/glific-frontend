import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { setNotification } from 'common/notification';
import { TERMINATE_FLOW } from 'graphql/mutations/Flow';
import { MessageChannel } from 'common/constants';
import styles from './TerminateFlow.module.css';

export interface TerminateFlowProps {
  contactId: String | undefined;
  setDialog: any;
  channel?: MessageChannel;
  web?: boolean;
}

export const TerminateFlow = ({ contactId, setDialog, channel, web }: TerminateFlowProps) => {
  const { t } = useTranslation();
  const [terminateFlow] = useMutation(TERMINATE_FLOW);

  const handleTerminateFlow = async () => {
    try {
      const { data } = await terminateFlow({ variables: { contactId, channel } });
      const terminateContactFlows = data?.terminateContactFlows;
      if (terminateContactFlows?.success) {
        setNotification('Flow terminated successfully');
      } else if (terminateContactFlows?.errors) {
        setNotification(terminateContactFlows.errors[0].message, 'warning');
        return;
      }
      setDialog(false);
    } catch {
      setNotification('Sorry, failed to terminate flow. Please try again.', 'warning');
    }
  };

  return (
    <DialogBox
      title={web ? t('Terminate web flows!') : 'Terminate flows!'}
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
        {web
          ? t(
              'All active web flows for the contact will be stopped. Their WhatsApp flows keep running. They can initiate a flow via keyword or you will need to do it manually.'
            )
          : 'All active flows for the contact will be stopped. They can initiate a flow via keyword or you will need to do it manually.'}
      </div>
    </DialogBox>
  );
};
