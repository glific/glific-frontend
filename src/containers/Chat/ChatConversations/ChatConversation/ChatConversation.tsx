import React from 'react';
import { ListItem, ListItemText, ListItemAvatar, Avatar } from '@material-ui/core';

//import styles from './ChatConversation.module.css';
import { ListIcon } from '../../../../components/UI/ListIcon/ListIcon'

export interface ChatConversationProps {
  contactId: number;
  contactName: string;
  lastMessage: string;
}

const ChatConversation: React.SFC<ChatConversationProps> = (props) => {
  return (
    <ListItem button alignItems="flex-start">
      <ListItemAvatar>
        <Avatar>
          <ListIcon icon='conversation' />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={props.contactName}
        secondary={props.lastMessage}
      />
    </ListItem>
  );
};

export default ChatConversation;
