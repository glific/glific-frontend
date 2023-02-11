import React from 'react';
import { ListItemButton } from '@mui/material';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useApolloClient, useMutation } from '@apollo/client';

import { COMPACT_MESSAGE_LENGTH, DATE_FORMAT } from 'common/constants';
import { Timer } from 'components/UI/Timer/Timer';
import { MARK_AS_READ, CONTACT_FRAGMENT } from 'graphql/mutations/Chat';
import { SEARCH_OFFSET } from 'graphql/queries/Search';
import { WhatsAppToJsx } from 'common/RichEditor';
import { MessageType } from '../MessageType/MessageType';
import styles from './ChatConversation.module.css';

export interface ChatConversationProps {
  contactId: number;
  contactName: string;
  contactStatus?: string;
  contactBspStatus?: string;
  contactIsOrgRead: boolean;
  selected: boolean;
  senderLastMessage: any;
  entityType: string;
  onClick?: (i: any) => void;
  index: number;
  lastMessage: {
    id: number;
    body: string;
    insertedAt: string;
    type: string;
    media: any;
  };
  messageNumber?: number;
  highlightSearch?: string | null;
  searchMode?: any;
}
const updateContactCache = (client: any, id: any) => {
  const contact = client.readFragment({
    id: `Contact:${id}`,
    fragment: CONTACT_FRAGMENT,
  });

  if (contact) {
    const contactCopy = JSON.parse(JSON.stringify(contact));

    contactCopy.isOrgRead = true;
    client.writeFragment({
      id: `Contact:${id}`,
      fragment: CONTACT_FRAGMENT,
      data: contactCopy,
    });
  }

  return null;
};

// display highlighted search message
const BoldedText = (originalText: string, highlight: any) => {
  const texts = highlight || '';

  // remove any formatting from the string
  const regex = /(_|\*|~|`)/gm;
  // eslint-disable-next-line
  const text = originalText.replace(regex, '');

  // Split on highlight term and include term into strings, ignore case
  const strings = text.split(new RegExp(`(${texts})`, 'gi'));

  if (strings.length > 0) {
    // let's do some smart formatting as search keyword might be lost when message is long
    // we know search keyword is always at odd index
    // get the length of search keyword
    const searchKeywordLength = texts.length;

    const formattedStringArray: any = [];

    // available character length
    const availableCharacterLength = COMPACT_MESSAGE_LENGTH - searchKeywordLength;
    strings.every((string, index) => {
      if (index === 0) {
        // we need calculate the length of the string before the search keyword
        const beforeSearchKeywordLength = strings[index].length;
        formattedStringArray[index] = string.substring(
          beforeSearchKeywordLength - availableCharacterLength / 2
        );
      } else if (index % 2 !== 0) {
        formattedStringArray[index] = string;
      } else {
        // calculate the length of strings that wil be displayed
        formattedStringArray[index] = string;
        const stringLength = formattedStringArray.join('');
        if (stringLength.length > availableCharacterLength) {
          formattedStringArray[index] = string.slice(0, availableCharacterLength / 2).concat('...');
          return false;
        }
      }
      return true;
    });

    return (
      <span>
        {formattedStringArray.map((string: String, i: any) =>
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

const ChatConversation = ({
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
  contactIsOrgRead,
  entityType,
  messageNumber,
  onClick,
}: ChatConversationProps) => {
  // check if message is unread and style it differently
  const client = useApolloClient();
  let chatInfoClass = [styles.ChatInfo, styles.ChatInfoRead];
  let chatBubble = [styles.ChatBubble, styles.ChatBubbleRead];

  const [markAsRead] = useMutation(MARK_AS_READ, {
    onCompleted: (data) => {
      if (data.markContactMessagesAsRead) {
        updateContactCache(client, contactId);
      }
    },
  });

  // Need to handle following cases:
  // a. there might be some cases when there are no conversations against the contact
  if (!contactIsOrgRead) {
    chatInfoClass = [styles.ChatInfo, styles.ChatInfoUnread];
    chatBubble = [styles.ChatBubble, styles.ChatBubbleUnread];
  }

  const name = contactName?.length > 20 ? `${contactName.slice(0, 20)}...` : contactName;

  const { type, body } = lastMessage;
  const isTextType = type === 'TEXT';

  let displayMSG: any = <MessageType type={type} body={body} />;

  let originalText = body;
  if (isTextType) {
    // let's shorten the text message to display correctly
    if (originalText.length > COMPACT_MESSAGE_LENGTH) {
      originalText = originalText.slice(0, COMPACT_MESSAGE_LENGTH).concat('...');
    }
    // replace new line characters with space to come in same line
    originalText = originalText.replace(/\n/g, ' ');

    displayMSG = WhatsAppToJsx(originalText);
  }

  // set offset to use that in chatting window to fetch that msg
  const setSearchOffset = (apolloClient: any, offset: number = 0) => {
    apolloClient.writeQuery({
      query: SEARCH_OFFSET,
      data: { offset, search: highlightSearch },
    });
  };

  const msgID = searchMode && messageNumber ? `?search=${messageNumber}` : '';

  let redirectURL = `/chat/${contactId}${msgID}`;
  if (entityType === 'collection') {
    redirectURL = `/chat/collection/${contactId}${msgID}`;
  } else if (entityType === 'savedSearch') {
    redirectURL = `/chat/saved-searches/${contactId}${msgID}`;
  }

  return (
    <ListItemButton
      key={index}
      data-testid="list"
      disableRipple
      className={`${styles.StyledListItem} ${selected ? styles.SelectedColor : ''}`}
      component={Link}
      selected={selected}
      onClick={() => {
        if (onClick) onClick(index);
        setSearchOffset(client, messageNumber);
        if (entityType === 'contact') {
          markAsRead({
            variables: { contactId: contactId.toString() },
          });
        }
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
          {isTextType && highlightSearch ? BoldedText(body, highlightSearch) : displayMSG}
        </div>
        <div className={styles.MessageDate} data-testid="date">
          {moment(lastMessage.insertedAt).format(DATE_FORMAT)}
        </div>
      </div>
    </ListItemButton>
  );
};

export default ChatConversation;
