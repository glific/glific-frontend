import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { ReactComponent as TagIcon } from '../../../../assets/icon/Tags/Selected.svg';
import Popper from '@material-ui/core/Popper';
import { Button } from '@material-ui/core';
import { ReactComponent as MessageIcon } from '../../../../assets/icon/Dropdown.svg';
import { ReactComponent as CrossIcon } from '../../../../assets/icon/Cross.svg';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';

import { Tooltip } from '../../../../components/UI/Tooltip/Tooltip';
import styles from './ChatMessage.module.css';
import { DATE_FORMAT, TIME_FORMAT } from '../../../../common/constants';

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
  focus: boolean;
}

export const ChatMessage: React.SFC<ChatMessageProps> = (props) => {
  const Ref = useRef(null);
  const messageRef = useRef<null | HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;
  let tag;

  useEffect(() => {
    if (props.popup) {
      setAnchorEl(Ref.current);
    } else {
      setAnchorEl(null);
    }
  }, [props.popup]);

  useEffect(() => {
    if (props.focus) {
      messageRef.current?.scrollIntoView();
    }
  }, [props.id]);

  let iconLeft = false;
  let placement: any = 'bottom-end';
  let additionalClass = styles.Mine;
  let mineColor: string | null = styles.MineColor;
  let iconPlacement = styles.ButtonLeft;
  let datePlacement: string | null = styles.DateLeft;
  let tagsPlacement: string | null = styles.TagsLeft;
  let tagPlacement: string | null = styles.TagLeft;
  let messageDetails = styles.MessageDetails;

  if (props.receiver.id === props.contactId) {
    additionalClass = styles.Other;
    mineColor = styles.OtherColor;
    iconLeft = true;
    placement = 'bottom-start';
    iconPlacement = styles.ButtonRight;
    datePlacement = null;
    tagsPlacement = null;
    tagPlacement = null;
    messageDetails = styles.MessageDetailsSender;
  }

  if (props.tags && props.tags.length > 0)
    tag = props.tags.map((tag: any) => {
      return (
        <div key={tag.id} className={`${styles.Tag} ${tagPlacement}`} data-testid="tags">
          <TagIcon className={styles.TagIcon} />
          {tag.label}
        </div>
      );
    });

  const icon = (
    <MessageIcon
      onClick={props.onClick}
      ref={Ref}
      className={`${styles.Button} ${iconPlacement}`}
      data-testid="messageOptions"
    />
  );

  return (
    <div className={additionalClass} ref={messageRef} data-testid="message">
      <div className={styles.Inline}>
        {iconLeft ? icon : null}
        <div className={`${styles.ChatMessage} ${mineColor}`}>
          <Tooltip title={moment(props.insertedAt).format(DATE_FORMAT)} placement="right">
            <div className={styles.Content} data-testid="content">
              {props.body}
            </div>
          </Tooltip>
          <Popper id={id} open={open} anchorEl={anchorEl} placement={placement} transition>
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={350}>
                <Paper elevation={3}>
                  <Button
                    className={styles.Popper}
                    color="primary"
                    onClick={props.setDialog}
                    data-testid="dialogButton"
                  >
                    Assign tag
                  </Button>
                </Paper>
              </Fade>
            )}
          </Popper>
        </div>
        {iconLeft ? null : icon}
      </div>

      <div className={messageDetails}>
        <div className={`${styles.Date} ${datePlacement}`} data-testid="date">
          {moment(props.insertedAt).format(TIME_FORMAT)}
        </div>
        {tag ? <div className={`${styles.Tags} ${tagsPlacement}`}>{tag}</div> : null}
      </div>
    </div>
  );
};

export default ChatMessage;
