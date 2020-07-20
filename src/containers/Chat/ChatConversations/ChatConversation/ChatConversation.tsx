import React, { useEffect } from 'react';
import clsx from 'clsx';
import { ListItem } from '@material-ui/core';
import { Link } from 'react-router-dom';
import moment from 'moment';
import styles from './ChatConversation.module.css';
import { DATE_FORMAT } from '../../../../common/constants';
import { MARK_AS_READ, MESSAGE_FRAGMENT } from '../../../../graphql/mutations/Chat';
import { useApolloClient, useMutation } from '@apollo/client';

export interface ChatConversationProps {
  contactId: number;
  contactName: string;
  selected: boolean;
  onClick: (i: any) => void;
  index: number;
  lastMessage: {
    body: string;
    insertedAt: string;
    tags: Array<{
      id: number;
      label: string;
    }>;
  };
}

const updateMessageCache = (client: any, data: any) => {
  data.map((messageId: any) => {
    const message = client.readFragment({
      id: `Message:${messageId}`,
      fragment: MESSAGE_FRAGMENT,
    });
    const messageCopy = JSON.parse(JSON.stringify(message));
    messageCopy.tags = messageCopy.tags.filter((tag: any) => tag.label !== 'Unread');
    client.writeFragment({
      id: `Message:${messageId}`,
      fragment: MESSAGE_FRAGMENT,
      data: messageCopy,
    });
  });
};

const ChatConversation: React.SFC<ChatConversationProps> = (props) => {
  // check if message is unread and style it differently
  const client = useApolloClient();
  let chatInfoClass = [styles.ChatInfo, styles.ChatInfoRead];
  let chatBubble = [styles.ChatBubble, styles.ChatBubbleRead];

  let unread = false;
  const [markAsRead] = useMutation(MARK_AS_READ, {
    onCompleted: (mydata) => {
      updateMessageCache(client, mydata.markContactMessagesAsRead);
    },
  });

  // check only if there are tags
  if (props.lastMessage.tags.length > 0) {
    // TODO: Need check with the backend on unique identifier for this.
    if (props.lastMessage.tags.filter((tag) => tag.label === 'Unread').length > 0) {
      chatInfoClass = [styles.ChatInfo, styles.ChatInfoUnread];
      chatBubble = [styles.ChatBubble, styles.ChatBubbleUnread];
      unread = true;
    }
  }

  useEffect(() => {
    if (unread && props.selected) {
      markAsRead({
        variables: { contactId: props.contactId.toString() },
      });
    }
  }, [unread, props.selected]);

  return (
    <ListItem
      data-testid="list"
      button
      disableRipple
      className={clsx(styles.StyledListItem, { [styles.SelectedColor]: props.selected })}
      component={Link}
      selected={props.selected}
      onClick={() => props.onClick(props.index)}
      to={'/chat/' + props.contactId}
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
