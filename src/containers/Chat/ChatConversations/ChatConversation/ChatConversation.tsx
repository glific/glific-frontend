import React from 'react';
import { ListItem, ListItemAvatar, Avatar } from '@material-ui/core';
import { Link } from 'react-router-dom';
import moment from 'moment';

import styles from './ChatConversation.module.css';
import { ListIcon } from '../../../../components/UI/ListIcon/ListIcon';

export interface ChatConversationProps {
  contactId: number;
  contactName: string;
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
      className={styles.StyledListItem}
      component={Link}
      to={'/chat/' + props.contactId}
    >
      <ListItemAvatar>
        <Avatar>
          <ListIcon icon="conversation" />
        </Avatar>
      </ListItemAvatar>
      <div className={styles.ChatInfo}>
        <div className={styles.ChatName} data-testid="name">
          {props.contactName}
        </div>
        <div className={styles.MessageContent} data-testid="content">
          {props.lastMessage.body}
        </div>
        <div className={styles.MessageDate} data-testid="date">
          {moment(props.lastMessage.insertedAt).format('HH:mm')}
        </div>
      </div>
    </ListItem>
  );
};

export default ChatConversation;
