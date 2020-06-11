import React from 'react';
import { ListItem, ListItemText, ListItemAvatar, Avatar, Typography } from '@material-ui/core';

import styles from './ChatConversation.module.css';
import { ListIcon } from '../../../../components/UI/ListIcon/ListIcon';

export interface ChatConversationProps {
  contactId: number;
  contactName: string;
  lastMessage: {
    content: string;
    date: string;
  };
}

const ChatConversation: React.SFC<ChatConversationProps> = (props) => {
  return (
    <ListItem button className={styles.StyledListItem}>
      <ListItemAvatar>
        <Avatar>
          <ListIcon icon="conversation" />
        </Avatar>
      </ListItemAvatar>
      <div className={styles.ChatInfo}>
        <div className={styles.ChatName}>{props.contactName}</div>
        <div className={styles.MessageContent}>{props.lastMessage.content}</div>
        <div className={styles.MessageDate}>{props.lastMessage.date}</div>
      </div>
      {/* <ListItem button alignItems="flex-start" className={styles.StyledListItem}>
      <ListItemText
        primary={props.contactName}
        // secondary={props.lastMessage.content}
        secondary={
          <>
            <Typography
              component="span"
              variant="body2"
              className={styles.LastMessage}
              color="textPrimary"
            >
              {props.lastMessage.content}
            </Typography>
            <br />
            {props.lastMessage.date}
          </>
        }
      /> */}
    </ListItem>
  );
};

export default ChatConversation;
