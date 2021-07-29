import React, { useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { FormControl, InputLabel, FormHelperText, OutlinedInput } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { setNotification } from 'common/notification';
import { WhatsAppToJsx } from 'common/RichEditor';
import { setVariables } from 'common/constants';
import { SAVE_MESSAGE_TEMPLATE_MUTATION } from 'graphql/mutations/MessageTemplate';
import { FILTER_TEMPLATES } from 'graphql/queries/Template';
import styles from './AddToMessageTemplate.module.css';

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
  const { t } = useTranslation();

  const [saveTemplate] = useMutation(SAVE_MESSAGE_TEMPLATE_MUTATION, {
    onCompleted: () => {
      setNotification(client, t('Message has been successfully added to speed sends.'));
    },
    refetchQueries: [
      {
        query: FILTER_TEMPLATES,
        variables: setVariables({ term: '' }),
      },
    ],
  });

  const onChange = (event: any) => {
    setMessageTemplate(event.target.value);
    if (required) {
      setRequired(false);
    }
  };

  const textField = (
    <div className={styles.DialogContainer} data-testid="templateContainer">
      <FormControl fullWidth error={required}>
        <InputLabel variant="outlined">Enter title</InputLabel>
        <OutlinedInput
          error={required}
          classes={{
            notchedOutline: styles.InputBorder,
          }}
          className={styles.Label}
          label={t('Enter title')}
          fullWidth
          data-testid="templateInput"
          onChange={onChange}
        />
        {required ? <FormHelperText>{t('Required')}</FormHelperText> : null}
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
      setMessageTemplate(null);
    }
  };

  return (
    <div>
      <DialogBox
        handleCancel={handleCloseButton}
        handleOk={handleOKButton}
        title={t('Add message to speed sends')}
        buttonOk={t('Save')}
      >
        {textField}
      </DialogBox>
    </div>
  );
};

export default AddToMessageTemplate;
