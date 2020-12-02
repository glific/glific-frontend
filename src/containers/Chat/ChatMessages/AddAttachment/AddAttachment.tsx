import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import styles from './AddAttachment.module.css';
import { DialogBox } from '../../../../components/UI/DialogBox/DialogBox';
import { Dropdown } from '../../../../components/UI/Form/Dropdown/Dropdown';
import { Input } from '../../../../components/UI/Form/Input/Input';
import { MessageType } from '../../ChatConversations/MessageType/MessageType';
import { MEDIA_MESSAGE_TYPES } from '../../../../common/constants';

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
  const options = MEDIA_MESSAGE_TYPES.map((option: string) => {
    return { id: option, label: <MessageType type={option} color="dark" /> };
  });

  const formFieldItems = [
    {
      component: Dropdown,
      options,
      name: 'attachmentType',
      placeholder: 'Type',
    },
    {
      component: Input,
      name: 'attachmentURL',
      type: 'text',
      placeholder: 'Attachment URL',
    },
  ];

  const validationSchema = Yup.object().shape({
    attachmentType: Yup.string().required('Type is required.'),
    attachmentURL: Yup.string().required('URL is required.'),
  });

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
            handleCancel={() => setAttachment(false)}
            buttonOk="Add"
            alignButtons="left"
          >
            <div className={styles.DialogContent} data-testid="attachmentDialog">
              {formFieldItems.map((field) => {
                return <Field {...field} />;
              })}
            </div>
          </DialogBox>
        </Form>
      )}
    </Formik>
  );

  return form;
};
