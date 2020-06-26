import React, { useState, useEffect } from 'react';
import moment from 'moment';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Popper from '@material-ui/core/Popper';
import { Button, Chip } from '@material-ui/core';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';

import styles from './ChatMessage.module.css';
import { DialogBox } from '../../../../components/UI/DialogBox/DialogBox';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { SAVE_MESSAGE_TEMPLATE_MUTATION } from '../../../../graphql/mutations/MessageTemplate';
import { IconButton, TextField } from '@material-ui/core';
import { NOTIFICATION } from '../../../../graphql/queries/Notification';
import { setNotification } from '../../../../common/notification';
import ToastMessage from '../../../../components/UI/ToastMessage/ToastMessage';

export interface ChatMessageProps {
  id: number;
  body: string;
  contactId: number;
  receiver: {
    id: number;
  };
  insertedAt: string;
  onClick: any;
  tags: any;
  popup: any;
  setDialog: any;
}

export const ChatMessage: React.SFC<ChatMessageProps> = (props) => {
  const client = useApolloClient();
  const Ref = React.useRef(null);
  const [anchorEl, setAnchorEl] = React.useState(null);

  // State to store editted message label.
  const [messageTemplate, setMessageTemplate] = useState<string | null>(null);

  const [saveTemplate, { data }] = useMutation(SAVE_MESSAGE_TEMPLATE_MUTATION);

  const message = useQuery(NOTIFICATION);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;
  let tag;
  if (props.tags && props.tags.length > 0)
    tag = props.tags.map((tag: any) => {
      return (
        <Chip size="small" key={tag.id} label={tag.label} color="primary" className={styles.Chip} />
      );
    });

  useEffect(() => {
    if (props.popup) {
      setAnchorEl(Ref.current);
    } else {
      setAnchorEl(null);
    }
  }, [props.popup]);

  const icon = (
    <IconButton size="small" onClick={props.onClick} ref={Ref} className={styles.button}>
      <ExpandMoreRoundedIcon />
    </IconButton>
  );

  let iconLeft = false;
  let tags: string | undefined = undefined;
  let placement: any = 'bottom-end';
  let additionalClass = styles.Mine;
  let mineColor: string | null = styles.MineColor;

  if (props.receiver.id === props.contactId) {
    additionalClass = styles.Other;
    mineColor = styles.OtherColor;
    iconLeft = true;
    tags = styles.TagsReceiver;
    placement = 'bottom-start';
  }

  const closeToastMessage = () => {
    setNotification(client, null);
  };

  const showDialogBox = (props: any = {}) => {
    setMessageTemplate(props.body);
  };

  const handleCloseButton = () => {
    setAnchorEl(anchorEl ? null : Ref.current);
    setMessageTemplate(null);
  };

  const handleOKButton = () => {
    saveTemplate({
      variables: {
        messageId: props.id,
        templateInput: {
          label: messageTemplate,
          shortcode: messageTemplate,
          languageId: '2',
        },
      },
    });
    console.log(data);
    setAnchorEl(anchorEl ? null : Ref.current);
    setNotification(client, 'Message has been successfully saved as template');
    setMessageTemplate(null);
  };

  const onChange = (event: any = {}) => {
    setMessageTemplate(event.target.value);
  };

  let textField;
  if (messageTemplate) {
    textField = (
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
  }

  let dialogBox;
  if (messageTemplate) {
    dialogBox = (
      <DialogBox
        handleCancel={handleCloseButton}
        handleOk={handleOKButton}
        title={'Save message as Template?'}
        children={textField}
      />
    );
  }

  let toastMessage;
  if (message.data && message.data.message) {
    toastMessage = <ToastMessage message={message.data.message} handleClose={closeToastMessage} />;
  }

  return (
    <div className={additionalClass}>
      <div className={styles.Inline}>
        {iconLeft ? icon : null}
        <div className={`${styles.ChatMessage} ${mineColor}`}>
          <div className={styles.Content} data-testid="content">
            {props.body}
          </div>
          <div className={styles.Date} data-testid="date">
            {moment(props.insertedAt).format('HH:mm')}
          </div>
          <Popper id={id} open={open} anchorEl={anchorEl} placement={placement} transition>
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={350}>
                <Paper elevation={3}>
                  <Button className={styles.Popper} color="primary" onClick={props.setDialog}>
                    Assign tag
                  </Button>
                  <br />
                  <Button
                    className={styles.Popper}
                    color="primary"
                    onClick={() => showDialogBox(props)}
                  >
                    Save Template
                  </Button>
                </Paper>
              </Fade>
            )}
          </Popper>
        </div>
        {iconLeft ? null : icon}
      </div>
      {dialogBox}
      {toastMessage}
      <div className={tags}>{tag}</div>
    </div>
  );
};

export default ChatMessage;
