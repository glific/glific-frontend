import React, { useEffect } from 'react';
import moment from 'moment';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import { IconButton } from '@material-ui/core';
import Popper from '@material-ui/core/Popper';
import Typography from '@material-ui/core/Typography';
import { Button, Chip } from '@material-ui/core';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';

import styles from './ChatMessage.module.css';
import { from } from '@apollo/client';

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

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;
  let tag;
  if (props.tags.length > 0)
    tag = props.tags.map((tag: any) => {
      return <Chip size="small" label={tag.label} color="primary" className={styles.Chip} />;
    });

  useEffect(() => {
    if (props.popup) setAnchorEl(Ref.current);
    else {
      setAnchorEl(null);
    }
  }, [props.popup]);

  let additionalClass = styles.Mine;

  if (props.receiver.id === props.contactId) {
    additionalClass = styles.Other;
  }

  return (
    <div className={styles.additionalClass}>
      <div className={styles.Inline}>
        <IconButton size="small" onClick={props.onClick} ref={Ref} className={styles.button}>
          <ExpandMoreRoundedIcon />
        </IconButton>
        <div className={styles.ChatMessage}>
          <div className={styles.Content} data-testid="content">
            {props.body}
          </div>
          <div className={styles.Date} data-testid="date">
            {moment(props.insertedAt).format('HH:mm')}
          </div>
          <Popper id={id} open={open} anchorEl={anchorEl} placement={'bottom-start'} transition>
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={350}>
                <Paper elevation={3}>
                  <Button className={styles.Popper} color="primary" onClick={props.setDialog}>
                    Assign tag
                  </Button>
                </Paper>
              </Fade>
            )}
          </Popper>
        </div>
      </div>

      {tag}
    </div>
  );
};

export default ChatMessage;
