import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import styles from './ErrorMessage.module.css';

export const ErrorMessage = ({ errors }: { errors: Array<string> | null }) => {
  return (
    <DialogBox
      title="An error occured!"
      colorCancel="warning"
      handleOk={() => {
        window.location.reload();
      }}
      buttonOk="Retry"
      alignButtons="center"
      contentAlign="center"
    >
      <div className={styles.Dialog}>
        Please Check the follwing errors
        <div className={styles.Errors}>
          {errors && errors.map((error, index) => <p key={index}>{error}</p>)}
        </div>
      </div>
    </DialogBox>
  );
};
