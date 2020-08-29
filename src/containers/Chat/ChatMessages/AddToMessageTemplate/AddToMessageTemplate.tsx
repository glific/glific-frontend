import React, { useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { SAVE_MESSAGE_TEMPLATE_MUTATION } from '../../../../graphql/mutations/MessageTemplate';
import { FormControl, InputLabel, FormHelperText, OutlinedInput } from '@material-ui/core';
import { DialogBox } from '../../../../components/UI/DialogBox/DialogBox';
import { setNotification } from '../../../../common/notification';
import styles from './AddToMessageTemplate.module.css';
import { WhatsAppToJsx } from '../../../../common/RichEditor';

interface AddToMessageTemplateProps {
  id: any;
  message: any;
  changeDisplay: Function;
}

export const AddToMessageTemplate: React.SFC<AddToMessageTemplateProps> = ({
  id,
  message,
  changeDisplay,
}) => {
  const client = useApolloClient();

  const [messageTemplate, setMessageTemplate] = useState<string | null>('');
  const [required, setRequired] = useState(false);

  const [saveTemplate] = useMutation(SAVE_MESSAGE_TEMPLATE_MUTATION);

  const onChange = (event: any) => {
    setMessageTemplate(event.target.value);
    if (required) {
      setRequired(false);
    }
  };

  let textField = (
    <div className={styles.DialogContainer} data-testid="templateContainer">
      <FormControl fullWidth error={required}>
        <InputLabel variant="outlined">Enter title</InputLabel>
        <OutlinedInput
          error={required}
          classes={{
            notchedOutline: styles.InputBorder,
          }}
          className={styles.Label}
          label="Enter title"
          fullWidth
          data-testid="templateInput"
          onChange={onChange}
        ></OutlinedInput>
        {required ? <FormHelperText>Required</FormHelperText> : null}
      </FormControl>
      <div className={styles.Message}>{WhatsAppToJsx(message)}</div>
    </div>
  );

  const handleCloseButton = () => {
    changeDisplay(false);
    setMessageTemplate(null);
  };

  const handleOKButton = () => {
    if (messageTemplate === '') {
      setRequired(true);
    } else {
      saveTemplate({
        variables: {
          messageId: id,
          templateInput: {
            label: messageTemplate,
            shortcode: messageTemplate,
            languageId: '2',
          },
        },
      });
      changeDisplay(false);
      setNotification(client, 'Message has been successfully added to speed sends.');
      setMessageTemplate(null);
    }
  };

  return (
    <div>
      <DialogBox
        handleCancel={handleCloseButton}
        handleOk={handleOKButton}
        title={'Add message to speed sends'}
        children={textField}
        buttonOk="Save"
      />
    </div>
  );
};

export default AddToMessageTemplate;
