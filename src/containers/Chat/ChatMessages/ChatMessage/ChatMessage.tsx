import React, { useState, useEffect } from 'react';
import moment from 'moment';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Popper from '@material-ui/core/Popper';
import { Button, Chip } from '@material-ui/core';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import styles from './ChatMessage.module.css';
import { IconButton } from '@material-ui/core';
import AddToMessageTemplate from '../AddToMessageTemplate/AddToMessageTemplate';

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
  const Ref = React.useRef(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  // Show Dialog Box
  const [showSaveMessageDialog, setShowSaveMessageDialog] = useState(false);

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

  const saveMessageTemplate = (display: boolean) => {
    setShowSaveMessageDialog(display);
    setAnchorEl(anchorEl ? null : Ref.current);
  };

  let saveTemplateMessage;
  if (showSaveMessageDialog) {
    saveTemplateMessage = (
      <AddToMessageTemplate
        id={props.id}
        message={props.body}
        changeDisplay={saveMessageTemplate}
      />
    );
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
                    onClick={() => setShowSaveMessageDialog(true)}
                  >
                    Save as Template
                  </Button>
                </Paper>
              </Fade>
            )}
          </Popper>
        </div>
        {iconLeft ? null : icon}
      </div>

      {saveTemplateMessage}
      <div className={tags}>{tag}</div>
    </div>
  );
};

export default ChatMessage;
