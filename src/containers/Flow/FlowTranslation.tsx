import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import styles from './FlowTranslation.module.css';

export interface FlowTranslationProps {
  flowId: string | undefined;
  setDialog: any;
}

export const FlowTranslation = ({ flowId, setDialog }: FlowTranslationProps) => {
  const handleOk = () => {
    console.log('handle ok!');
    setDialog(false);
  };

  const dialogContent = (
    <div>
      <div>Show Options:</div>
    </div>
  );

  return (
    <DialogBox
      title="Translate Flow"
      alignButtons="center"
      buttonOk="Auto translate"
      buttonCancel="Cancel"
      additionalTitleStyles={styles.Title}
      handleOk={handleOk}
      handleCancel={() => {
        setDialog(false);
      }}
    >
      {dialogContent}
    </DialogBox>
  );
};

export default FlowTranslation;
