import React from 'react';
import clsx from 'clsx';
import { ListItem } from '@material-ui/core';
import { Link } from 'react-router-dom';
import moment from 'moment';

import styles from './ChatConversation.module.css';
import { DATE_FORMAT } from '../../../../common/constants';

export interface ChatConversationProps {
  contactId: number;
  contactName: string;
  selected: boolean;
  onClick: (i: any) => void;
  index: number;
  lastMessage: {
    body: string;
    insertedAt: string;
    tags: [
      {
        id: number;
        label: string;
      }
    ];
  };
}

const ChatConversation: React.SFC<ChatConversationProps> = (props) => {
  // check if message is unread then style it differently
  // TODO: Need check with the backend on unique identifier for this.
  let chatInfoClass = [styles.ChatInfo, styles.ChatInfoRead];
  let chatBubble = [styles.ChatBubble, styles.ChatBubbleRead];

  if (props.lastMessage.tags.length > 0) {
    console.log('label', props);
    if (props.lastMessage.tags.filter((tag) => tag.label === 'Unread')) {
      chatInfoClass = [styles.ChatInfo, styles.ChatInfoUnread];
      chatBubble = [styles.ChatBubble, styles.ChatBubbleUnread];
    }
  }

  return (
    <ListItem
      data-testid="list"
      button
      disableRipple
      className={clsx(styles.StyledListItem, { [styles.SelectedColor]: props.selected })}
      component={Link}
      selected={props.selected}
      onClick={() => props.onClick(props.index)}
      to={'/chat/' + props.contactId} // Index doesn't equal ID
    >
      <div>
        <div className={chatBubble.join(' ')} />
      </div>
      <div className={chatInfoClass.join(' ')}>
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
