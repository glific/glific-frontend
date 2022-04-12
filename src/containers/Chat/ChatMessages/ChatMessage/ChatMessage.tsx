import React, { useEffect, useRef, useState } from 'react';
// import { useApolloClient } from '@apollo/client';
import Popper from '@material-ui/core/Popper';
import { Button } from '@material-ui/core';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { ReactComponent as TagIcon } from 'assets/images/icons/Tags/Filled.svg';
import { ReactComponent as WarningIcon } from 'assets/images/icons/Warning.svg';
import { ReactComponent as MessageIcon } from 'assets/images/icons/Dropdown.svg';
// import { ReactComponent as CloseIcon } from 'assets/images/icons/Close.svg';
import {
  DATE_FORMAT,
  TIME_FORMAT,
  INTERACTIVE_LIST,
  INTERACTIVE_QUICK_REPLY,
} from 'common/constants';
// import { UPDATE_MESSAGE_TAGS } from 'graphql/mutations/Chat';
// import { setNotification } from 'common/notification';
import { WhatsAppToJsx, WhatsAppTemplateButton } from 'common/RichEditor';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import { parseTextMethod } from 'common/utils';
import { AddToMessageTemplate } from '../AddToMessageTemplate/AddToMessageTemplate';
import { TemplateButtons } from '../TemplateButtons/TemplateButtons';
import { ChatMessageType } from './ChatMessageType/ChatMessageType';
import { ListReplyTemplate, ChatTemplate } from '../ListReplyTemplate/ListReplyTemplate';
import { QuickReplyTemplate } from '../QuickReplyTemplate/QuickReplyTemplate';
import styles from './ChatMessage.module.css';

export interface ChatMessageProps {
  id: number;
  body: string;
  contactId: number;
  receiver: {
    id: number;
  };
  sender: {
    id: number;
  };
  messageNumber?: any;
  type: string;
  media: any;
  insertedAt: string;
  onClick?: any;
  tags: Array<any>;
  popup: any;
  setDialog?: any;
  focus?: boolean;
  showMessage: boolean;
  location: any;
  errors: any;
  contextMessage: any;
  jumpToMessage: any;
  interactiveContent: string;
  sendBy: string;
  flowLabel: string | null;
  daySeparator: string | null;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  id,
  popup,
  focus,
  sender,
  contactId,
  // tags,
  insertedAt,
  onClick,
  type,
  media,
  body,
  messageNumber,
  location,
  errors,
  contextMessage,
  jumpToMessage,
  interactiveContent,
  sendBy,
  flowLabel,
  daySeparator,
}) => {
  // const client = useApolloClient();
  const [showSaveMessageDialog, setShowSaveMessageDialog] = useState(false);
  const Ref = useRef(null);
  const messageRef = useRef<null | HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const { t } = useTranslation();

  const open = Boolean(anchorEl);
  const popperId = open ? 'simple-popper' : undefined;
  // let displayTag: any;
  // let deleteId: string | number;

  useEffect(() => {
    if (popup) {
      setAnchorEl(Ref.current);
    } else {
      setAnchorEl(null);
    }
  }, [popup]);

  useEffect(() => {
    if (focus) {
      messageRef.current?.scrollIntoView();
    }
  }, []);

  // tagging delete mutation
  // const [deleteTag] = useMutation(UPDATE_MESSAGE_TAGS, {
  //   onCompleted: () => {
  //     setNotification(client, t('Tag deleted successfully.'));
  //   },
  // });

  let iconLeft = false;
  let placement: any = 'bottom-end';
  let additionalClass = styles.Mine;
  let mineColor: string | null = styles.MineColor;
  let iconPlacement = styles.ButtonLeft;
  let datePlacement: string | null = styles.DateLeft;
  // let tagContainer: string | null = styles.TagContainerSender;
  let labelContainer: string | null = styles.LabelContainerSender;
  // let tagMargin: string | null = styles.TagMargin;
  let labelMargin: string | null = styles.LabelMargin;
  let messageDetails = styles.MessageDetails;
  const messageError = errors ? parseTextMethod(errors) : {};
  let messageErrorStatus: any = false;
  let tooltipTitle: any = moment(insertedAt).format(DATE_FORMAT);

  // Check if the message has an error after sending the message.
  if (Object.prototype.hasOwnProperty.call(messageError, 'payload')) {
    messageErrorStatus = true;
    tooltipTitle = (
      <>
        {tooltipTitle}
        <div className={styles.ErrorMessage}>{messageError.payload.payload.reason}</div>
      </>
    );
  } else if (Object.prototype.hasOwnProperty.call(messageError, 'message')) {
    messageErrorStatus = parseTextMethod(messageError.message);
    tooltipTitle = (
      <>
        {tooltipTitle}
        <div className={styles.ErrorMessage}>{messageErrorStatus[0]}</div>
      </>
    );
  } else if (Object.keys(messageError).length !== 0) {
    messageErrorStatus = true;
    tooltipTitle = (
      <>
        {tooltipTitle}
        <div className={styles.ErrorMessage}>{messageError}</div>
      </>
    );
  }

  const isSender = sender.id === contactId;

  if (isSender) {
    additionalClass = styles.Other;
    mineColor = styles.OtherColor;
    iconLeft = true;
    placement = 'bottom-start';
    iconPlacement = styles.ButtonRight;
    datePlacement = null;
    // tagContainer = null;
    labelContainer = null;
    // tagMargin = null;
    labelMargin = null;
    messageDetails = styles.MessageDetailsSender;
  }

  const saveMessageTemplate = (display: boolean) => {
    setShowSaveMessageDialog(display);
  };

  const downloadExtension = () => {
    /**
     * The code below is only to add extension to the media file so that the default application
     * in desktop/PCs gets detected and it doesn't throw an error with invalid file type.
     */
    switch (type) {
      case 'VIDEO':
        return '.mp4';
      case 'AUDIO':
        return '.m4a';
      case 'IMAGE':
        return '.png';
      default:
        break;
    }
    return '';
  };

  const downloadMedia = () => {
    const link = document.createElement('a');
    link.href = media.url + downloadExtension();
    link.setAttribute('download', link.href);
    document.body.appendChild(link);
    link.click();
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  };

  let saveTemplateMessage;
  if (showSaveMessageDialog) {
    saveTemplateMessage = (
      <AddToMessageTemplate
        id={id}
        message={WhatsAppToJsx(body)}
        changeDisplay={saveMessageTemplate}
      />
    );
  }

  // const deleteTagHandler = (event: any) => {
  //   deleteId = event.currentTarget.getAttribute('data-id');
  //   deleteTag({
  //     variables: {
  //       input: {
  //         messageId: props.id,
  //         addTagIds: [],
  //         deleteTagIds: [deleteId],
  //       },
  //     },
  //   });
  // };

  // if (tags && tags.length > 0)
  //   displayTag = tags.map((tag: any) => (
  //     <div
  //       key={tag.id}
  //       className={`${styles.Tag} ${tagMargin}`}
  //       style={{ color: tag.colorCode }}
  //       data-testid="tags"
  //     >
  //       <TagIcon className={styles.TagIcon} stroke={tag.colorCode ? tag.colorCode : '#0C976D'} />
  //       {tag.label}
  //       <CloseIcon
  //         className={styles.CloseIcon}
  //         onClick={deleteTagHandler}
  //         data-id={tag.id}
  //         data-testid="deleteIcon"
  //       />
  //     </div>
  //   ));

  const sendByLabel = !isSender && sendBy;
  let messageFooter;
  if (sendByLabel) {
    messageFooter = `${sendBy} | ${moment(insertedAt).format(TIME_FORMAT)}`;
  } else {
    messageFooter = moment(insertedAt).format(TIME_FORMAT);
  }

  const dateAndSendBy = messageFooter && (
    <div className={`${styles.Date} ${datePlacement}`} data-testid="date">
      {messageFooter}
    </div>
  );

  // show day separator if the message is sent on the next day
  let daySeparatorContent = null;
  if (daySeparator) {
    daySeparatorContent = (
      <div className={styles.DaySeparator} data-testid="daySeparator">
        <p className={styles.DaySeparatorContent}>{moment(insertedAt).format(DATE_FORMAT)}</p>
      </div>
    );
  }

  const icon = (
    <MessageIcon
      onClick={onClick}
      ref={Ref}
      className={`${styles.Button} ${iconPlacement}`}
      data-testid="messageOptions"
    />
  );

  const ErrorIcon = messageErrorStatus ? (
    <Tooltip
      title={t('Something went wrong! This message could not be sent.')}
      placement={isSender ? 'right' : 'left'}
      tooltipClass={styles.WarningTooltip}
      tooltipArrowClass={styles.ArrowTooltip}
    >
      <WarningIcon className={styles.ErrorMsgIcon} />
    </Tooltip>
  ) : null;

  const { body: bodyText, buttons: templateButtons } = WhatsAppTemplateButton(body);

  const content: any = JSON.parse(interactiveContent);
  const isInteractiveContentPresent: Boolean = content ? !!Object.entries(content).length : false;

  const errorClasses = messageErrorStatus ? styles.ErrorContent : '';
  const stickerClasses = type === 'STICKER' ? styles.StickerBackground : '';

  const chatMessageClasses = [styles.ChatMessage, mineColor, errorClasses, stickerClasses];
  const chatMessageContent = [styles.Content];

  if (isInteractiveContentPresent && !isSender) {
    chatMessageClasses.push(styles.InteractiveMessage);
    chatMessageClasses.push(styles.InteractiveMessageMimeColor);
    chatMessageContent.push(styles.InteractiveContent);
  }

  let template = null;
  if (type === INTERACTIVE_LIST) {
    template = <ListReplyTemplate {...content} disabled component={ChatTemplate} />;
  }

  if (type === INTERACTIVE_QUICK_REPLY) {
    template = <QuickReplyTemplate {...content} disabled />;
  }

  let displayLabel;
  if (flowLabel) {
    const labels = flowLabel.split(',');
    if (labels.length > 0) {
      displayLabel = labels.map((label: string) => (
        <div key={label} className={`${styles.Label} ${labelMargin}`} data-testid="labels">
          <TagIcon className={styles.LabelIcon} stroke="#073f24" />
          {label}
        </div>
      ));
    }
  }
  return (
    <div>
      {daySeparatorContent}
      <div
        className={additionalClass}
        ref={messageRef}
        data-testid="message"
        id={`search${messageNumber}`}
      >
        {contextMessage ? (
          <Tooltip title={moment(contextMessage.insertedAt).format(DATE_FORMAT)} placement="right">
            <div
              className={styles.ReplyMessage}
              onClick={() => jumpToMessage(contextMessage.messageNumber)}
              aria-hidden="true"
              data-testid="reply-message"
            >
              <div className={styles.ReplyMainWrap}>
                <div>
                  <div className={styles.ReplyContact}>
                    {contextMessage.sender.id === contactId ? contextMessage.sender.name : 'You'}
                  </div>
                  <div className={styles.ReplyMessageBody}>
                    <ChatMessageType
                      type={contextMessage.type}
                      media={contextMessage.media}
                      body={contextMessage.body}
                      insertedAt={contextMessage.insertedAt}
                      location={contextMessage.location}
                      isContextMessage
                    />
                  </div>
                </div>
              </div>
            </div>
          </Tooltip>
        ) : null}

        <div className={styles.Inline}>
          {iconLeft ? icon : null}
          {ErrorIcon}
          <div className={chatMessageClasses.join(' ')}>
            <Tooltip title={tooltipTitle} placement={isSender ? 'right' : 'left'}>
              <div>
                <div className={chatMessageContent.join(' ')} data-testid="content">
                  {isInteractiveContentPresent && !isSender ? (
                    template
                  ) : (
                    <ChatMessageType
                      type={type}
                      media={media}
                      body={bodyText}
                      insertedAt={insertedAt}
                      location={location}
                    />
                  )}
                </div>
              </div>
            </Tooltip>

            <Popper
              id={popperId}
              open={open}
              modifiers={{
                preventOverflow: {
                  enabled: true,
                  boundariesElement: 'scrollParent',
                },
              }}
              anchorEl={anchorEl}
              placement={placement}
              transition
              data-testid="popup"
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                  <Paper elevation={3}>
                    {/* <Button
                    className={styles.Popper}
                    color="primary"
                    onClick={props.setDialog}
                    data-testid="dialogButton"
                  >
                    {t('Assign tag')}
                  </Button>
                  <br /> */}
                    <Button
                      className={styles.Popper}
                      color="primary"
                      onClick={() => setShowSaveMessageDialog(true)}
                    >
                      {t('Add to speed sends')}
                    </Button>
                    {type !== 'TEXT' && (
                      <span>
                        <br />
                        <Button
                          className={styles.Popper}
                          color="primary"
                          onClick={() => downloadMedia()}
                          data-testid="downloadMedia"
                        >
                          {t('Download media')}
                        </Button>
                      </span>
                    )}
                  </Paper>
                </Fade>
              )}
            </Popper>
          </div>
          {iconLeft ? null : icon}
        </div>

        {saveTemplateMessage}

        <div className={messageDetails}>
          <div className={`${messageErrorStatus ? styles.TemplateButtonOnError : ''}`}>
            {templateButtons && <TemplateButtons template={templateButtons} />}
          </div>
          {dateAndSendBy}
          {/* {displayTag ? (
          <div className={`${styles.TagContainer} ${tagContainer}`}>{displayTag}</div>
        ) : null} */}
          {displayLabel ? (
            <div className={`${styles.LabelContainer} ${labelContainer}`}>{displayLabel}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
