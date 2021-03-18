import React, { useState } from 'react';
import { EditorState, ContentState } from 'draft-js';
import { Container, Button, ClickAwayListener, Fade, IconButton } from '@material-ui/core';
import 'emoji-mart/css/emoji-mart.css';
import clsx from 'clsx';
import { useMutation } from '@apollo/client';

import { ReactComponent as AttachmentIcon } from '../../../../assets/images/icons/Attachment/Unselected.svg';
import { ReactComponent as AttachmentIconSelected } from '../../../../assets/images/icons/Attachment/Selected.svg';
import { ReactComponent as VariableIcon } from '../../../../assets/images/icons/Template/Variable.svg';
import { ReactComponent as CrossIcon } from '../../../../assets/images/icons/Clear.svg';

import styles from './ChatInput.module.css';
import { convertToWhatsApp, WhatsAppToDraftEditor } from '../../../../common/RichEditor';
import { ReactComponent as SendMessageIcon } from '../../../../assets/images/icons/SendMessage.svg';
import SearchBar from '../../../../components/UI/SearchBar/SearchBar';
import ChatTemplates from '../ChatTemplates/ChatTemplates';
import WhatsAppEditor from '../../../../components/UI/Form/WhatsAppEditor/WhatsAppEditor';
import { AddAttachment } from '../AddAttachment/AddAttachment';
import { CREATE_MEDIA_MESSAGE } from '../../../../graphql/mutations/Chat';
import { is24HourWindowOver, pattern } from '../../../../common/constants';
import { AddVariables } from '../AddVariables/AddVariables';
import Tooltip from '../../../../components/UI/Tooltip/Tooltip';

export interface ChatInputProps {
  onSendMessage(
    content: string,
    mediaId: string | null,
    messageType: string,
    selectedTemplate: any,
    variableParam: any
  ): any;
  handleHeightChange(newHeight: number): void;
  contactStatus?: string;
  contactBspStatus?: string;
  additionalStyle?: any;
  lastMessageTime?: any;
}

export const ChatInput: React.SFC<ChatInputProps> = (props) => {
  const {
    contactBspStatus,
    contactStatus,
    additionalStyle,
    handleHeightChange,
    lastMessageTime,
  } = props;
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [selectedTab, setSelectedTab] = useState('');
  const [open, setOpen] = React.useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [attachment, setAttachment] = useState(false);
  const [attachmentAdded, setAttachmentAdded] = useState(false);
  const [attachmentType, setAttachmentType] = useState<any>();
  const [attachmentURL, setAttachmentURL] = useState('');
  const [variable, setVariable] = useState(false);
  const [updatedEditorState, setUpdatedEditorState] = useState<any>();
  const [selectedTemplate, setSelectedTemplate] = useState<any>();
  const [variableParam, setVariableParam] = useState<any>([]);
  const speedSends = 'Speed sends';
  const templates = 'Templates';

  let dialog;

  const resetVariable = () => {
    setUpdatedEditorState(undefined);
    setEditorState(EditorState.createEmpty());
    setSelectedTemplate(undefined);
    setVariableParam([]);
  };

  const [createMediaMessage] = useMutation(CREATE_MEDIA_MESSAGE, {
    onCompleted: (data: any) => {
      if (data) {
        props.onSendMessage(
          '',
          data.createMessageMedia.messageMedia.id,
          attachmentType,
          selectedTemplate,
          variableParam
        );
        setAttachmentAdded(false);
        setAttachmentURL('');
        setAttachmentType('');
        resetVariable();
      }
    },
  });

  if (attachment) {
    const dialogProps = {
      attachmentType,
      attachmentURL,
      setAttachment,
      setAttachmentAdded,
      setAttachmentType,
      setAttachmentURL,
    };
    dialog = <AddAttachment {...dialogProps} />;
  }

  const submitMessage = (message: string) => {
    if (!message || message === ' \n') return;

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
      props.onSendMessage(message, null, 'TEXT', selectedTemplate, variableParam);
      resetVariable();
    }

    // Resetting the EditorState
    setEditorState(
      EditorState.moveFocusToEnd(
        EditorState.push(editorState, ContentState.createFromText(''), 'remove-range')
      )
    );
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

  const resetAttachment = () => {
    setAttachmentAdded(false);
    setAttachmentURL('');
    setAttachmentType('');
  };

  const handleSelectText = (obj: any) => {
    resetVariable();

    // set selected template
    setSelectedTemplate(obj);

    // Conversion from HTML text to EditorState
    setEditorState(EditorState.createWithContent(WhatsAppToDraftEditor(obj.body)));

    // Add attachment if present
    if (Object.prototype.hasOwnProperty.call(obj, 'MessageMedia') && obj.MessageMedia) {
      const type = obj.type ? obj.type : obj.MessageMedia.type;
      setAttachmentAdded(true);
      setAttachmentURL(obj.MessageMedia.sourceUrl);
      setAttachmentType(type);
    } else {
      resetAttachment();
    }

    // check if variable present
    const isVariable = obj.body.match(pattern);
    if (isVariable) {
      setVariable(true);
    }
  };

  const handleCancel = () => {
    resetAttachment();
    resetVariable();
  };

  const updateEditorState = (body: string) => {
    setUpdatedEditorState(body);
  };

  const variableParams = (params: Array<any>) => {
    setVariableParam(params);
  };

  if (variable) {
    const bodyText = selectedTemplate ? selectedTemplate.body : '';
    const dialogProps = {
      bodyText,
      setVariable,
      handleCancel,
      updateEditorState,
      variableParams,
      variableParam,
    };
    dialog = <AddVariables {...dialogProps} />;
  }

  const handleSearch = (e: any) => {
    setSearchVal(e.target.value);
  };

  const quickSendButtons = (quickSendTypes: any) => {
    const buttons = quickSendTypes.map((type: string) => (
      <div
        key={type}
        data-testid="shortcutButton"
        onClick={() => handleClick(type)}
        aria-hidden="true"
        className={clsx(styles.QuickSend, {
          [styles.QuickSendSelected]: selectedTab === type,
        })}
      >
        {type}
      </div>
    ));
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
    if (is24HourWindowOver(lastMessageTime)) {
      quickSendTypes = [templates];
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
        <WhatsAppEditor
          editorState={
            updatedEditorState
              ? EditorState.createWithContent(WhatsAppToDraftEditor(updatedEditorState))
              : editorState
          }
          setEditorState={setEditorState}
          sendMessage={submitMessage}
          handleHeightChange={handleHeightChange}
          readOnly={selectedTemplate !== undefined && selectedTemplate.isHsm}
        />

        {selectedTemplate ? (
          <Tooltip title="Remove message" placement="top">
            <IconButton
              className={updatedEditorState ? styles.CrossIcon : styles.CrossIconWithVariable}
              onClick={() => {
                resetVariable();
                resetAttachment();
              }}
            >
              <CrossIcon />
            </IconButton>
          </Tooltip>
        ) : null}
        {updatedEditorState ? (
          <IconButton
            className={styles.VariableIcon}
            onClick={() => {
              setVariable(!variable);
            }}
          >
            <VariableIcon />
          </IconButton>
        ) : null}
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
            onClick={() => {
              if (updatedEditorState) {
                submitMessage(
                  convertToWhatsApp(
                    EditorState.createWithContent(WhatsAppToDraftEditor(updatedEditorState))
                  )
                );
              } else {
                submitMessage(convertToWhatsApp(editorState));
              }
            }}
            disabled={!editorState.getCurrentContent().hasText() && !attachmentAdded}
          >
            <SendMessageIcon className={styles.SendIcon} />
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default ChatInput;
