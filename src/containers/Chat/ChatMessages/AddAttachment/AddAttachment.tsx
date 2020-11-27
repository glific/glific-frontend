import React from 'react';

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
  return (
    <DialogBox
      titleAlign="left"
      title="Add attachments to message"
      handleOk={() => {
        setAttachmentAdded(true);
        setAttachment(false);
      }}
      handleCancel={() => setAttachment(false)}
      buttonOk="Add"
      alignButtons="left"
    >
      <div className={styles.DialogContent}>
        <div className={styles.Dropdown}>
          <Dropdown
            options={options}
            label="Select Type"
            placeholder="Type"
            field={{
              value: attachmentType,
              onChange: (event: any) => {
                setAttachmentType(event.target.value);
              },
            }}
          />
        </div>
        <div className={styles.Input}>
          <Input
            field={{
              name: 'input',
              value: attachmentURL,
              onChange: (event: any) => {
                setAttachmentURL(event.target.value);
              },
            }}
            label="input"
            placeholder="Attachment URL"
          />
        </div>
      </div>
    </DialogBox>
  );
};
