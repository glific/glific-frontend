import { useCallback, useState } from 'react';
import { EditorState, ContentState } from 'draft-js';
import { Container, Button, ClickAwayListener, Fade, IconButton } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import AttachmentIcon from 'assets/images/icons/Attachment/Unselected.svg?react';
import AttachmentIconSelected from 'assets/images/icons/Attachment/Selected.svg?react';
import VariableIcon from 'assets/images/icons/Template/Variable.svg?react';
import CrossIcon from 'assets/images/icons/Clear.svg?react';
import SendMessageIcon from 'assets/images/icons/SendMessage.svg?react';
import { getPlainTextFromEditor, getEditorFromContent } from 'common/RichEditor';
import { is24HourWindowOver, pattern } from 'common/constants';
import SearchBar from 'components/UI/SearchBar/SearchBar';
import WhatsAppEditor, { updatedValue } from 'components/UI/Form/WhatsAppEditor/WhatsAppEditor';
import Tooltip from 'components/UI/Tooltip/Tooltip';
import { CREATE_MEDIA_MESSAGE, UPLOAD_MEDIA_BLOB } from 'graphql/mutations/Chat';
import { GET_ATTACHMENT_PERMISSION } from 'graphql/queries/Settings';
import { setNotification } from 'common/notification';
import { getInteractiveMessageBody } from 'common/utils';
import { EmojiPicker } from 'components/UI/EmojiPicker/EmojiPicker';
import { AddVariables } from '../AddVariables/AddVariables';
import { AddAttachment } from '../AddAttachment/AddAttachment';
import { VoiceRecorder } from '../VoiceRecorder/VoiceRecorder';
import ChatTemplates from '../ChatTemplates/ChatTemplates';
import styles from './ChatInput.module.css';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  LexicalCommand,
  TextNode,
  createCommand,
} from 'lexical';

export interface ChatInputProps {
  onSendMessage(
    content: any,
    mediaId: string | null,
    messageType: string,
    selectedTemplate: any,
    variableParam: any,
    interactiveTemplateId?: any
  ): any;
  handleHeightChange(newHeight: number): void;
  contactStatus?: string;
  contactBspStatus?: string;
  additionalStyle?: any;
  isCollection?: any;
  lastMessageTime?: any;
}

export const ChatInput = ({
  onSendMessage,
  contactBspStatus,
  contactStatus,
  additionalStyle,
  handleHeightChange,
  isCollection,
  lastMessageTime,
}: ChatInputProps) => {
  const [editorState, setEditorState] = useState<any>('');
  const [selectedTab, setSelectedTab] = useState('');
  const [open, setOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [attachment, setAttachment] = useState(false);
  const [attachmentAdded, setAttachmentAdded] = useState(false);
  const [interactiveMessageContent, setInteractiveMessageContent] = useState<any>({});
  const [attachmentType, setAttachmentType] = useState<any>();
  const [attachmentURL, setAttachmentURL] = useState('');
  const [variable, setVariable] = useState(false);
  const [updatedEditorState, setUpdatedEditorState] = useState<any>();
  const [selectedTemplate, setSelectedTemplate] = useState<any>();
  const [variableParam, setVariableParam] = useState<any>([]);
  const [recordedAudio, setRecordedAudio] = useState<any>('');
  const [clearAudio, setClearAudio] = useState<any>(false);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { t } = useTranslation();
  const [editor] = useLexicalComposerContext();

  const speedSends = 'Speed sends';
  const templates = 'Templates';
  const interactiveMsg = 'Interactive msg';
  let uploadPermission = false;

  let dialog;

  const resetVariable = () => {
    setUpdatedEditorState(undefined);
    setEditorState('');
    setSelectedTemplate(undefined);
    setInteractiveMessageContent({});
    setVariableParam([]);

    // clear the editor state
    editor.update(() => {
      $getRoot().clear();
    });
    editor.focus();
  };

  const { data: permission } = useQuery(GET_ATTACHMENT_PERMISSION);

  const [createMediaMessage] = useMutation(CREATE_MEDIA_MESSAGE, {
    onCompleted: (data: any) => {
      if (data) {
        onSendMessage(
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
  const [uploadMediaBlob] = useMutation(UPLOAD_MEDIA_BLOB, {
    onCompleted: (data: any) => {
      if (data) {
        setAttachmentType('AUDIO');
        createMediaMessage({
          variables: {
            input: {
              caption: '',
              sourceUrl: data.uploadBlob,
              url: data.uploadBlob,
            },
          },
        });

        setClearAudio(true);
        setRecordedAudio('');
        setUploading(false);
      }
    },
    onError: () => {
      setNotification(t('Sorry, unable to upload audio.'), 'warning');
      setUploading(false);
    },
  });

  const submitMessage = async (message: string) => {
    // let's check if we are sending voice recording
    if (recordedAudio) {
      // converting blob into base64 format as needed by backend
      const reader = new FileReader();
      reader.readAsDataURL(recordedAudio);
      reader.onloadend = () => {
        const base64String: any = reader.result;
        // get the part without the tags
        const media = base64String.split(',')[1];
        // save media that will return an URL
        uploadMediaBlob({
          variables: {
            media,
            extension: 'mp3',
          },
        });
      };
      setUploading(true);
    }

    // check for an empty message or message with just spaces
    if ((!message || /^\s*$/.test(message)) && !attachmentAdded) return;

    // check if there is any attachment
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
      // check if type is list or quick replies
    } else if (interactiveMessageContent && interactiveMessageContent.type) {
      onSendMessage(
        null,
        null,
        interactiveMessageContent.type.toUpperCase(),
        null,
        null,
        Number(selectedTemplate.id)
      );
      resetVariable();
      // else the type will by default be text
    } else {
      onSendMessage(message, null, 'TEXT', selectedTemplate, variableParam);
      resetVariable();
    }

    // Resetting the EditorState
    editor.update(() => {
      const root = $getRoot();
      root.clear();
    });
    editor.focus();
  };

  const emojiStyles = {
    position: 'absolute',
    bottom: '60px',
    right: '-150px',
    zIndex: 100,
  };

  if (window.innerWidth <= 768) {
    emojiStyles.right = '5%';
  }

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

  const handleSelectText = (obj: any, isInteractiveMsg: boolean = false) => {
    resetVariable();
    // set selected template

    let messageBody = obj.body;
    if (isInteractiveMsg) {
      const interactiveContent = JSON.parse(obj.interactiveContent);
      messageBody = getInteractiveMessageBody(interactiveContent);
      setInteractiveMessageContent(interactiveContent);
    }

    setSelectedTemplate(obj);
    // Conversion from HTML text to EditorState
    setEditorState(getEditorFromContent(messageBody));
    editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(messageBody || ''));
      root.append(paragraph);
    });

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
    const isVariable = obj.body?.match(pattern);
    if (isVariable) {
      setVariable(true);
    }
    handleClickAway();
  };

  const handleCancel = () => {
    resetAttachment();
    resetVariable();
  };

  const updateEditorState = (body: string) => {
    setUpdatedEditorState(true);
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(body));
      root.append(paragraph);
    });
  };

  const variableParams = (params: Array<any>) => {
    setVariableParam(params);
  };
  const handleEmojiClickAway = () => {
    setShowEmojiPicker(false);
  };

  if (variable) {
    const dialogProps = {
      template: selectedTemplate,
      setVariable,
      handleCancel,
      updateEditorState,
      variableParams,
      variableParam,
    };
    dialog = <AddVariables {...dialogProps} />;
  }

  const handleAudioRecording = (blob: any) => {
    setRecordedAudio(blob);
    setClearAudio(false);
  };

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
        className={`${styles.QuickSend} ${selectedTab === type ? styles.QuickSendSelected : ''}`}
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
        quickSendTypes = [speedSends, interactiveMsg];
        break;
      case 'SESSION_AND_HSM':
        quickSendTypes = [speedSends, templates, interactiveMsg];
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
        {t(
          'Sorry, chat is unavailable with this contact at this moment because they aren’t opted in to your number.'
        )}
      </div>
    );
  }

  if (isCollection) {
    quickSendTypes = [speedSends, templates];
  }
  let audioOption: any;
  // enable audio only if GCS is configured
  if (permission && permission.attachmentsEnabled) {
    if (!selectedTemplate && Object.keys(interactiveMessageContent).length === 0) {
      audioOption = (
        <VoiceRecorder
          handleAudioRecording={handleAudioRecording}
          clearAudio={clearAudio}
          uploading={uploading}
          isMicActive={recordedAudio !== ''}
        />
      );
    }
    uploadPermission = true;
  }

  if (attachment) {
    const dialogProps = {
      attachmentType,
      attachmentURL,
      setAttachment,
      setAttachmentAdded,
      setAttachmentType,
      setAttachmentURL,
      uploadPermission,
    };
    dialog = <AddAttachment {...dialogProps} />;
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
                  isInteractiveMsg={selectedTab === interactiveMsg}
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
        className={`${styles.ChatInputElements} ${
          selectedTab === '' ? styles.Rounded : styles.Unrounded
        }`}
      >
        <WhatsAppEditor
          setEditorState={setEditorState}
          sendMessage={submitMessage}
          handleHeightChange={handleHeightChange}
          readOnly={
            (selectedTemplate !== undefined && selectedTemplate.isHsm) ||
            Object.keys(interactiveMessageContent).length !== 0
          }
        />
        <div className={styles.Icons}>
          {audioOption}

          {selectedTemplate || Object.keys(interactiveMessageContent).length > 0 ? (
            <Tooltip title={t('Remove message')} placement="top">
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
            data-testid="attachmentIcon"
            className={styles.AttachmentIcon}
            onClick={() => {
              setAttachment(!attachment);
            }}
          >
            {attachment || attachmentAdded ? <AttachmentIconSelected /> : <AttachmentIcon />}
          </IconButton>
          <ClickAwayListener onClickAway={handleEmojiClickAway}>
            <div>
              <IconButton
                className={styles.EmojiButton}
                data-testid="emoji-picker"
                color="primary"
                aria-label="pick emoji"
                component="span"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <span role="img" aria-label="pick emoji">
                  😀
                </span>
              </IconButton>

              {showEmojiPicker ? (
                <EmojiPicker onEmojiSelect={() => {}} displayStyle={emojiStyles} />
              ) : null}
            </div>
          </ClickAwayListener>
          <div className={styles.SendButtonContainer}>
            <Button
              className={styles.SendButton}
              data-testid="sendButton"
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => {
                submitMessage(editorState);
              }}
              // disabled={(!attachmentAdded && !recordedAudio) || uploading}
            >
              <SendMessageIcon className={styles.SendIcon} />
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ChatInput;
