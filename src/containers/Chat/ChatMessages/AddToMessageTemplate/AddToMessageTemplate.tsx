import React, { useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { SAVE_MESSAGE_TEMPLATE_MUTATION } from '../../../../graphql/mutations/MessageTemplate';
import { TextField } from '@material-ui/core';
import { DialogBox } from '../../../../components/UI/DialogBox/DialogBox';
import { setNotification } from '../../../../common/notification';

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

  const [messageTemplate, setMessageTemplate] = useState<string | null>(message);

  const [saveTemplate] = useMutation(SAVE_MESSAGE_TEMPLATE_MUTATION);

  const onChange = (event: any = {}) => {
    console.log(event.target.value);
    setMessageTemplate(event.target.value);
  };

  let textField = (
    <TextField
      autoFocus
      margin="dense"
      id="name"
      type="text"
      fullWidth
      value={messageTemplate}
      onChange={onChange}
    />
  );

  const handleCloseButton = () => {
    changeDisplay(false);
    setMessageTemplate(null);
  };

  const handleOKButton = () => {
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
    setNotification(client, 'Message has been successfully saved as template.');
    setMessageTemplate(null);
  };

  return (
    <div>
      <DialogBox
        handleCancel={handleCloseButton}
        handleOk={handleOKButton}
        title={'Save message as Template?'}
        children={textField}
      />
    </div>
  );
};

export default AddToMessageTemplate;
