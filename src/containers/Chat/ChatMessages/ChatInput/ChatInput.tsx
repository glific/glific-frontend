import React, { useState, useEffect } from 'react';
import { EditorState, ContentState } from 'draft-js';
import { Container, Button, ClickAwayListener, Fade, IconButton } from '@material-ui/core';
import 'emoji-mart/css/emoji-mart.css';
import clsx from 'clsx';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useApolloClient, useMutation } from '@apollo/client';
import { ReactComponent as AttachmentIcon } from '../../../../assets/images/icons/Attachment/Unselected.svg';
import { ReactComponent as AttachmentIconSelected } from '../../../../assets/images/icons/Attachment/Selected.svg';
import styles from './ChatInput.module.css';
import { convertToWhatsApp, WhatsAppToDraftEditor } from '../../../../common/RichEditor';
import sendMessageIcon from '../../../../assets/images/icons/SendMessage.svg';
import SearchBar from '../../../../components/UI/SearchBar/SearchBar';
import ChatTemplates from '../ChatTemplates/ChatTemplates';
import WhatsAppEditor from '../../../../components/UI/Form/WhatsAppEditor/WhatsAppEditor';
import { SEARCH_OFFSET } from '../../../../graphql/queries/Search';
import { AddAttachment } from '../AddAttachment/AddAttachment';
import { CREATE_MEDIA_MESSAGE } from '../../../../graphql/mutations/Chat';

export interface ChatInputProps {
  onSendMessage(content: string, mediaId: string | null, messageType: string): any;
  handleHeightChange(newHeight: number): void;
  contactStatus: string;
  contactBspStatus: string;
  additionalStyle?: any;
}

export const ChatInput: React.SFC<ChatInputProps> = (props) => {
  const { contactBspStatus, contactStatus, additionalStyle, handleHeightChange } = props;
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [selectedTab, setSelectedTab] = useState('');
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [attachment, setAttachment] = useState(false);
  const [attachmentAdded, setAttachmentAdded] = useState(false);
  const [attachmentType, setAttachmentType] = useState('');
  const [attachmentURL, setAttachmentURL] = useState('');
  const speedSends = 'Speed sends';
  const templates = 'Templates';
  const client = useApolloClient();

  let dialog;

  const [createMediaMessage] = useMutation(CREATE_MEDIA_MESSAGE, {
    onCompleted: (data: any) => {
      if (data) {
        props.onSendMessage('', data.createMessageMedia.messageMedia.id, attachmentType);
        setAttachmentAdded(false);
      }
    },
  });

  if (attachment) {
    dialog = (
      <AddAttachment
        setAttachment={setAttachment}
        setAttachmentAdded={setAttachmentAdded}
        setAttachmentType={setAttachmentType}
        setAttachmentURL={setAttachmentURL}
      />
    );
  }

  useEffect(() => {
    const messageContainer: any = document.querySelector('.messageContainer');
    if (messageContainer) {
      messageContainer.addEventListener('scroll', (event: any) => {
        const messageContainerTarget = event.target;
        if (
          messageContainerTarget.scrollTop ===
          messageContainerTarget.scrollHeight - messageContainerTarget.offsetHeight
        ) {
          setShowJumpToLatest(false);
        } else if (showJumpToLatest === false) {
          setShowJumpToLatest(true);
        }
      });
    }
  }, [setShowJumpToLatest]);

  const submitMessage = (message: string) => {
    if (!message) return;

    // Resetting the EditorState
    setEditorState(
      EditorState.moveFocusToEnd(
        EditorState.push(editorState, ContentState.createFromText(''), 'remove-range')
      )
    );

    if (attachmentAdded) {
      createMediaMessage({
        variables: {
          input: {
            caption: message,
            sourceUrl: attachmentURL,
            url: attachmentURL,
          },
        },
      });
    } else {
      props.onSendMessage(message, null, 'TEXT');
    }
  };

  const handleClick = (title: string) => {
    // clear the search when tab is opened again
    setSearchVal('');
    if (selectedTab === title) {
      setSelectedTab('');
    } else {
      setSelectedTab(title);
    }
    setOpen(selectedTab !== title);
  };

  const handleClickAway = () => {
    setOpen(false);
    setSelectedTab('');
  };

  const handleSelectText = (obj: any) => {
    // Conversion from HTML text to EditorState
    setEditorState(EditorState.createWithContent(WhatsAppToDraftEditor(obj.body)));
  };

  const handleSearch = (e: any) => {
    setSearchVal(e.target.value);
  };

  const quickSendButtons = (quickSendTypes: any) => {
    const buttons = quickSendTypes.map((type: string) => {
      return (
        <div
          key={type}
          data-testid="shortcutButton"
          onClick={() => handleClick(type)}
          onKeyDown={() => handleClick(type)}
          aria-hidden="true"
          className={clsx(styles.QuickSend, {
            [styles.QuickSendSelected]: selectedTab === type,
          })}
        >
          {type}
        </div>
      );
    });
    return <div className={styles.QuickSendButtons}>{buttons}</div>;
  };

  // determine what kind of messages we should display
  let quickSendTypes: any = [];
  if (contactBspStatus) {
    switch (contactBspStatus) {
      case 'SESSION':
        quickSendTypes = [speedSends];
        break;
      case 'SESSION_AND_HSM':
        quickSendTypes = [speedSends, templates];
        break;
      case 'HSM':
        quickSendTypes = [templates];
        break;
      default:
        break;
    }
  }

  if ((contactStatus && contactStatus === 'INVALID') || contactBspStatus === 'NONE') {
    return (
      <div className={styles.ContactOptOutMessage}>
        Sorry, chat is unavailable with this contact at this moment because they aren’t opted in to
        your number.
      </div>
    );
  }

  const showLatestMessage = () => {
    const container: any = document.querySelector('.messageContainer');
    if (container) {
      container.scrollTop = container.scrollHeight - container.clientHeight;
    }
    // set offset to zero to fetch latest data
    client.writeQuery({
      query: SEARCH_OFFSET,
      data: { offset: 0 },
    });
    setShowJumpToLatest(false);
  };

  const jumpToLatest = (
    <div
      className={styles.JumpToLatest}
      onClick={() => showLatestMessage()}
      onKeyDown={showLatestMessage}
      aria-hidden="true"
    >
      Jump to latest
      <ExpandMoreIcon />
    </div>
  );

  return (
    <Container
      className={`${styles.ChatInput} ${additionalStyle}`}
      data-testid="message-input-container"
    >
      {dialog}
      <ClickAwayListener onClickAway={handleClickAway}>
        <div className={styles.SendsContainer}>
          {open ? (
            <Fade in={open} timeout={200}>
              <div className={styles.Popup}>
                <ChatTemplates
                  isTemplate={selectedTab === templates}
                  searchVal={searchVal}
                  handleSelectText={handleSelectText}
                />
                <SearchBar
                  className={styles.ChatSearchBar}
                  handleChange={handleSearch}
                  onReset={() => setSearchVal('')}
                  searchMode
                />
              </div>
            </Fade>
          ) : null}
          {quickSendButtons(quickSendTypes)}
        </div>
      </ClickAwayListener>
      <div
        className={clsx(styles.ChatInputElements, {
          [styles.Unrounded]: selectedTab !== '',
          [styles.Rounded]: selectedTab === '',
        })}
      >
        {showJumpToLatest === true ? jumpToLatest : null}

        <WhatsAppEditor
          editorState={editorState}
          setEditorState={setEditorState}
          sendMessage={submitMessage}
          handleHeightChange={handleHeightChange}
        />
        <IconButton
          className={styles.AttachmentIcon}
          onClick={() => {
            setAttachment(!attachment);
          }}
        >
          {attachment || attachmentAdded ? <AttachmentIconSelected /> : <AttachmentIcon />}
        </IconButton>

        <div className={styles.SendButtonContainer}>
          <Button
            className={styles.SendButton}
            data-testid="sendButton"
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => submitMessage(convertToWhatsApp(editorState))}
            disabled={!editorState.getCurrentContent().hasText() && !attachmentAdded}
          >
            Send
            <img className={styles.SendIcon} src={sendMessageIcon} alt="Send Message" />
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default ChatInput;
