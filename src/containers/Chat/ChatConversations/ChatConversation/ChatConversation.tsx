import React from 'react';
import clsx from 'clsx';
import { ListItem } from '@material-ui/core';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useApolloClient, useMutation } from '@apollo/client';

import styles from './ChatConversation.module.css';
import { DATE_FORMAT } from '../../../../common/constants';
import { WhatsAppToJsx } from '../../../../common/RichEditor';
import { Timer } from '../../../../components/UI/Timer/Timer';

import { MARK_AS_READ, MESSAGE_FRAGMENT } from '../../../../graphql/mutations/Chat';
import { SEARCH_OFFSET } from '../../../../graphql/queries/Search';
import { MessageType } from '../MessageType/MessageType';

export interface ChatConversationProps {
  contactId: number;
  contactName: string;
  contactStatus?: string;
  contactBspStatus?: string;
  selected: boolean;
  senderLastMessage: any;
  entityType: string;
  onClick?: (i: any) => void;
  index: number;
  lastMessage: {
    id: number;
    body: string;
    isRead: boolean;
    insertedAt: string;
    type: string;
    media: any;
    tags: Array<{
      id: number;
      label: string;
    }>;
  };
  messageNumber?: number;
  highlightSearch?: string;
  searchMode?: any;
}
const updateMessageCache = (client: any, id: any) => {
  const message = client.readFragment({
    id: `Message:${id}`,
    fragment: MESSAGE_FRAGMENT,
  });

  const messageCopy = JSON.parse(JSON.stringify(message));
  messageCopy.isRead = true;
  client.writeFragment({
    id: `Message:${id}`,
    fragment: MESSAGE_FRAGMENT,
    data: messageCopy,
  });

  return null;
};
const ChatConversation: React.SFC<ChatConversationProps> = (props) => {
  // check if message is unread and style it differently
  const client = useApolloClient();
  let chatInfoClass = [styles.ChatInfo, styles.ChatInfoRead];
  let chatBubble = [styles.ChatBubble, styles.ChatBubbleRead];
  const {
    lastMessage,
    selected,
    contactId,
    contactName,
    index,
    highlightSearch,
    searchMode,
    senderLastMessage,
    contactStatus,
    contactBspStatus,
    entityType,
  } = props;

  const [markAsRead] = useMutation(MARK_AS_READ, {
    onCompleted: () => {
      updateMessageCache(client, lastMessage.id);
    },
  });
  // there might be some cases when there are no conversations againist the contact. So need to handle that
  // Also handle unread formatting only if tags array is set.
  if (Object.keys(lastMessage).length > 0) {
    // TODO: Need check with the backend on unique identifier for this.

    if (!lastMessage.isRead) {
      chatInfoClass = [styles.ChatInfo, styles.ChatInfoUnread];
      chatBubble = [styles.ChatBubble, styles.ChatBubbleUnread];
    }
  }

  // display highlighted search message
  const BoldedText = (text: string, highlight: any) => {
    const texts = highlight || '';
    // Split on highlight term and include term into strings, ignore case
    const strings = typeof text === 'string' ? text.split(new RegExp(`(${texts})`, 'gi')) : null;

    if (strings) {
      return (
        <span>
          {strings.map((string, i) =>
            string.toLowerCase() === texts.toLowerCase() ? (
              // it is ok to use "i" as index as we are not altering sequence etc. and alphabets can repeat etc.
              // eslint-disable-next-line
              <span key={i} className={styles.TitleText}>
                {string}
              </span>
            ) : (
              string
            )
          )}
        </span>
      );
    }
    return text;
  };

  const name = contactName.length > 20 ? `${contactName.slice(0, 20)}...` : contactName;

  const { type, body } = lastMessage;
  const isTextType = type === 'TEXT';
  let displayMSG: any = <MessageType type={type} body={body} />;

  if (isTextType) {
    displayMSG = WhatsAppToJsx(displayMSG);
  }

  // set offset to use that in chatting window to fetch that msg
  const setSearchOffset = (apolloClient: any, offset: number = 0) => {
    apolloClient.writeQuery({
      query: SEARCH_OFFSET,
      data: { offset, search: highlightSearch },
    });
  };

  const msgID = searchMode ? `/#search${lastMessage.id}` : '';

  let redirectURL = `/chat/${contactId}${msgID}`;
  if (entityType === 'collection') {
    redirectURL = `/chat/collection/${contactId}${msgID}`;
  }

  return (
    <ListItem
      data-testid="list"
      button
      disableRipple
      className={clsx(styles.StyledListItem, { [styles.SelectedColor]: selected })}
      component={Link}
      selected={selected}
      onClick={() => {
        if (props.onClick) props.onClick(index);
        setSearchOffset(client, props.messageNumber);
        markAsRead({
          variables: { contactId: contactId.toString() },
        });
      }}
      to={redirectURL}
    >
      <div>
        {entityType === 'contact' ? (
          <div className={styles.ChatIcons}>
            <div className={chatBubble.join(' ')} />
            <div className={styles.Timer}>
              <Timer
                time={senderLastMessage}
                contactStatus={contactStatus}
                contactBspStatus={contactBspStatus}
              />
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
      <div className={chatInfoClass.join(' ')}>
        <div className={styles.ChatName} data-testid="name">
          {name}
        </div>
        <div className={styles.MessageContent} data-testid="content">
          {isTextType && displayMSG[0]
            ? BoldedText(displayMSG[0].props.body, highlightSearch)
            : displayMSG}
        </div>
        <div className={styles.MessageDate} data-testid="date">
          {moment(lastMessage.insertedAt).format(DATE_FORMAT)}
        </div>
      </div>
    </ListItem>
  );
};

export default ChatConversation;
