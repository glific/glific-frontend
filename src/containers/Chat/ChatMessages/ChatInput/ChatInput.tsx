import React, { useState } from 'react';
import { EditorState, ContentState } from 'draft-js';
import { Container, Button, ClickAwayListener, Fade, IconButton } from '@material-ui/core';
import 'emoji-mart/css/emoji-mart.css';
import clsx from 'clsx';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';

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
import { VoiceRecorder } from '../VoiceRecorder/VoiceRecorder';
import { CREATE_MEDIA_MESSAGE, UPLOAD_MEDIA_BLOB } from '../../../../graphql/mutations/Chat';
import { is24HourWindowOver, pattern } from '../../../../common/constants';
import { AddVariables } from '../AddVariables/AddVariables';
import Tooltip from '../../../../components/UI/Tooltip/Tooltip';
import { GET_ATTACHMENT_PERMISSION } from '../../../../graphql/queries/Settings';
import { setNotification } from '../../../../common/notification';

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
  isCollection?: any;
  lastMessageTime?: any;
}

export const ChatInput: React.SFC<ChatInputProps> = (props) => {
  const {
    contactBspStatus,
    contactStatus,
    additionalStyle,
    handleHeightChange,
    isCollection,
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
  const [recordedAudio, setRecordedAudio] = useState<any>('');
  const [clearAudio, setClearAudio] = useState<any>(false);
  const [uploading, setUploading] = useState(false);

  const { t } = useTranslation();
  const speedSends = 'Speed sends';
  const templates = 'Templates';
  const interactiveMsg = 'Interactive msg';
  let uploadPermission = false;
  const client = useApolloClient();

  let dialog;

  const resetVariable = () => {
    setUpdatedEditorState(undefined);
    setEditorState(EditorState.createEmpty());
    setSelectedTemplate(undefined);
    setVariableParam([]);
  };

  const { data: permission } = useQuery(GET_ATTACHMENT_PERMISSION);

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
      setNotification(client, t('Sorry, unable to upload audio.'), 'warning');
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
        quickSendTypes = [speedSends, interactiveMsg];
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
    if (!selectedTemplate) {
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
        {audioOption}
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
            disabled={
              (!editorState.getCurrentContent().hasText() && !attachmentAdded && !recordedAudio) ||
              uploading
            }
          >
            <SendMessageIcon className={styles.SendIcon} />
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default ChatInput;
