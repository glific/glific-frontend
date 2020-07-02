import React, { useState } from 'react';
import clsx from 'clsx';
import { ListItem } from '@material-ui/core';
import { Link } from 'react-router-dom';
import moment from 'moment';

import styles from './ChatConversation.module.css';
import { DATE_FORMAT } from '../../../../common/constants';

export interface ChatConversationProps {
  conversationIndex: number;
  contactId: number;
  contactName: string;
  selected: boolean;
  onClick: (i: any) => void;
  lastMessage: {
    body: string;
    insertedAt: string;
    tags: {
      id: number;
      label: string;
    };
  };
}

const ChatConversation: React.SFC<ChatConversationProps> = (props) => {
  return (
    <ListItem
      button
      disableRipple
      className={clsx(styles.StyledListItem, { [styles.SelectedColor]: props.selected })}
      // className={clsx(classes.drawer, {
      //   [classes.drawerOpen]: fullOpen,
      //   [classes.drawerClose]: !fullOpen,
      // })}
      component={Link}
      selected={props.selected}
      onClick={() => props.onClick(props.conversationIndex)}
      to={'/chat/' + props.conversationIndex} // Index doesn't equal ID
    >
      <div className={styles.CircleBox}>
        <div className={styles.Status} />
      </div>
      <div className={styles.ChatInfo}>
        <div className={styles.ChatName} data-testid="name">
          {props.contactName}
        </div>
        <div className={styles.MessageContent} data-testid="content">
          {props.lastMessage.body}
        </div>
        <div className={styles.MessageDate} data-testid="date">
          {moment(props.lastMessage.insertedAt).format(DATE_FORMAT)}
        </div>
      </div>
    </ListItem>
  );
};

export default ChatConversation;
