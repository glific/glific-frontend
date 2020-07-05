import React, { useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { SAVE_MESSAGE_TEMPLATE_MUTATION } from '../../../../graphql/mutations/MessageTemplate';
import { FormControl, Input, InputLabel, FormHelperText } from '@material-ui/core';
import { DialogBox } from '../../../../components/UI/DialogBox/DialogBox';
import { setNotification } from '../../../../common/notification';
import styles from './AddToMessageTemplate.module.css';

interface AddToMessageTemplateProps {
  id: any;
  message: any;
  changeDisplay: Function;
}

const AddToMessageTemplate: React.SFC<AddToMessageTemplateProps> = ({
  id,
  message,
  changeDisplay,
}) => {
  const client = useApolloClient();

  const [messageTemplate, setMessageTemplate] = useState<string | null>('');
  const [required, setRequired] = useState(false);

  const [saveTemplate] = useMutation(SAVE_MESSAGE_TEMPLATE_MUTATION);

  const onChange = (event: any = {}) => {
    setMessageTemplate(event.target.value);
  };

  let textField = (
    <div className={styles.DialogContainer} data-testid="templateContainer">
      <FormControl fullWidth error={required}>
        <InputLabel htmlFor="component-error">Label</InputLabel>
        <Input
          id="label"
          onChange={onChange}
          aria-describedby="component-error-text"
          required
          data-testid="templateInput"
        />
        {required ? <FormHelperText id="component-error-text">Required</FormHelperText> : null}
      </FormControl>
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
      />
    </div>
  );
};

export default AddToMessageTemplate;
