import { ListItemButton } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { useApolloClient, useMutation } from '@apollo/client';

import { COMPACT_MESSAGE_LENGTH, SHORT_DATE_FORMAT } from 'common/constants';
import { MARK_AS_READ, CONTACT_FRAGMENT } from 'graphql/mutations/Chat';
import { SEARCH_OFFSET } from 'graphql/queries/Search';
import { WhatsAppToJsx } from 'common/RichEditor';
import { MessageType } from '../MessageType/MessageType';
import styles from './ChatConversation.module.css';
import Track from 'services/TrackService';
import { slicedString } from 'common/utils';
import { AvatarDisplay } from 'components/UI/AvatarDisplay/AvatarDisplay';
import { Timer } from 'components/UI/Timer/Timer';

export interface ChatConversationProps {
  entityId: number;
  contactName: string;
  contactIsOrgRead: boolean;
  selected: boolean;
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
  timer?: any;
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
  entityId,
  contactName,
  index,
  highlightSearch,
  searchMode,
  contactIsOrgRead,
  entityType,
  messageNumber,
  onClick,
  timer,
}: ChatConversationProps) => {
  // check if message is unread and style it differently
  const client = useApolloClient();
  let chatInfoClass = [styles.ChatInfo, styles.ChatInfoRead];
  const location = useLocation();

  let groups: boolean = location.pathname.includes('group');
  const [markAsRead] = useMutation(MARK_AS_READ, {
    onCompleted: (data) => {
      if (data.markContactMessagesAsRead) {
        updateContactCache(client, entityId);
      }
    },
  });

  // Need to handle following cases:
  // a. there might be some cases when there are no conversations against the contact
  if (!contactIsOrgRead) {
    chatInfoClass = [styles.ChatInfo, styles.ChatInfoUnread];
  }

  const name = slicedString(contactName, 20);

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
  let redirectRoute: string = groups ? '/group/chat' : '/chat';

  let redirectURL = `${redirectRoute}/${entityId}${msgID}`;
  if (entityType === 'collection') {
    redirectURL = `${redirectRoute}/collection/${entityId}${msgID}`;
  } else if (entityType === 'savedSearch') {
    redirectURL = `${redirectRoute}/saved-searches/${entityId}${msgID}`;
  }

  let avatar: any = '';
  if (groups && entityType === 'contact') {
    avatar = <AvatarDisplay name={name} />;
  } else if (entityType === 'contact') {
    avatar = <AvatarDisplay name={name} badgeDisplay={!contactIsOrgRead} />;
  }

  let handleOnClick = () => {
    if (onClick) onClick(index);
    setSearchOffset(client, messageNumber);
    if (entityType === 'contact') {
      Track(groups ? 'View Group Details' : 'View contact');
      if (!groups) {
        markAsRead({
          variables: { contactId: entityId.toString() },
        });
      }
    }
  };

  return (
    <ListItemButton
      key={index}
      data-testid="list"
      disableRipple
      className={`${styles.StyledListItem} ${selected ? styles.SelectedColor : ''}`}
      component={Link}
      selected={selected}
      onClick={handleOnClick}
      to={redirectURL}
    >
      <div>{avatar}</div>
      <div className={chatInfoClass.join(' ')} data-testid="chatInfo">
        <div className={styles.ChatName} data-testid="name">
          {name}
        </div>
        <div className={styles.MessageContent} data-testid="content">
          {isTextType && highlightSearch ? BoldedText(body, highlightSearch) : displayMSG}
        </div>
      </div>
      <div>
        <div className={styles.MessageDate} data-testid="date">
          {dayjs(lastMessage.insertedAt).format(SHORT_DATE_FORMAT)}
        </div>
        <div className={styles.MessageDate} data-testid="timerContainer">
          <Timer {...timer} />
        </div>
      </div>
    </ListItemButton>
  );
};

export default ChatConversation;
