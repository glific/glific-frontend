import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import styles from './AddAttachment.module.css';
import { DialogBox } from '../../../../components/UI/DialogBox/DialogBox';
import { Dropdown } from '../../../../components/UI/Form/Dropdown/Dropdown';
import { Input } from '../../../../components/UI/Form/Input/Input';
import { MessageType } from '../../ChatConversations/MessageType/MessageType';
import { MEDIA_MESSAGE_TYPES } from '../../../../common/constants';
import { ReactComponent as CrossIcon } from '../../../../assets/images/icons/Cross.svg';
import { validateMedia } from '../../../../common/utils';

const options = MEDIA_MESSAGE_TYPES.map((option: string) => {
  return { id: option, label: <MessageType type={option} color="dark" /> };
});

export interface AddAttachmentPropTypes {
  setAttachment: any;
  setAttachmentURL: any;
  setAttachmentAdded: any;
  setAttachmentType: any;
  attachmentURL: any;
  attachmentType: any;
}

export const AddAttachment: React.FC<AddAttachmentPropTypes> = ({
  setAttachment,
  setAttachmentAdded,
  setAttachmentURL,
  setAttachmentType,
  attachmentURL,
  attachmentType,
}: AddAttachmentPropTypes) => {
  const validateURL = (value: string) => {
    if (value && attachmentType) {
      return validateMedia(value, attachmentType).then((response: any) => {
        if (!response.data.is_valid) {
          return response.data.message;
        }
        return null;
      });
    }
    return true;
  };

  const input = {
    component: Input,
    name: 'attachmentURL',
    type: 'text',
    placeholder: 'Attachment URL',
    validate: validateURL,
  };

  let formFieldItems: any = [
    {
      component: Dropdown,
      options,
      name: 'attachmentType',
      placeholder: 'Type',
      fieldValue: attachmentType,
      fieldChange: (event: any) => {
        setAttachmentType(event?.target.value);
      },
    },
  ];

  formFieldItems = attachmentType !== '' ? [...formFieldItems, input] : formFieldItems;

  const validationSchema = Yup.object().shape({
    attachmentType: Yup.string().required('Type is required.'),
    attachmentURL: Yup.string().required('URL is required.'),
  });

  const displayWarning = () => {
    if (attachmentType === 'STICKER') {
      return (
        <div className={styles.FormHelperText}>
          <ol>
            <li>Animated stickers are not supported.</li>
            <li>Captions along with stickers are not supported.</li>
          </ol>
        </div>
      );
    }
    return (
      <div className={styles.FormHelperText}>
        <ol>
          <li>Captions along with audio are not supported.</li>
        </ol>
      </div>
    );
  };

  const form = (
    <Formik
      enableReinitialize
      initialValues={{ attachmentURL, attachmentType }}
      validationSchema={validationSchema}
      onSubmit={(itemData) => {
        setAttachmentType(itemData.attachmentType);
        setAttachmentURL(itemData.attachmentURL);
        setAttachmentAdded(true);
        setAttachment(false);
      }}
    >
      {({ submitForm }) => (
        <Form className={styles.Form} data-testid="formLayout">
          <DialogBox
            titleAlign="left"
            title="Add attachments to message"
            handleOk={() => {
              submitForm();
            }}
            handleCancel={() => {
              setAttachment(false);
            }}
            buttonOk="Add"
            alignButtons="left"
          >
            <div className={styles.DialogContent} data-testid="attachmentDialog">
              {formFieldItems.map((field: any) => {
                return <Field {...field} key={field.name} />;
              })}
              {attachmentType !== '' ? (
                <div className={styles.CrossIcon}>
                  <CrossIcon
                    data-testid="crossIcon"
                    onClick={() => {
                      setAttachmentType('');
                      setAttachmentURL('');
                      setAttachmentAdded(false);
                    }}
                  />
                </div>
              ) : null}
              {attachmentType === 'STICKER' || attachmentType === 'AUDIO' ? displayWarning() : null}
            </div>
          </DialogBox>
        </Form>
      )}
    </Formik>
  );

  return form;
};
