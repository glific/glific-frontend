import { useEffect, useRef, useState } from 'react';
import { Button, Popper, Fade, Paper } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import LabelIcon from 'assets/images/icons/Label/Filled.svg?react';
import WarningIcon from 'assets/images/icons/Warning.svg?react';
import {
  SHORT_DATE_FORMAT,
  SHORT_TIME_FORMAT,
  LIST,
  QUICK_REPLY,
  VALID_URL_REGEX,
  LOCATION_REQUEST,
} from 'common/constants';
import MessageIcon from 'assets/images/icons/Dropdown.svg?react';
import { WhatsAppToJsx, WhatsAppTemplateButton } from 'common/RichEditor';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import { parseTextMethod } from 'common/utils';
import { AddToMessageTemplate } from '../AddToMessageTemplate/AddToMessageTemplate';
import { TemplateButtons } from '../TemplateButtons/TemplateButtons';
import { ChatMessageType } from './ChatMessageType/ChatMessageType';
import { ListReplyTemplate, ChatTemplate } from '../ListReplyTemplate/ListReplyTemplate';
import { QuickReplyTemplate } from '../QuickReplyTemplate/QuickReplyTemplate';
import styles from './ChatMessage.module.css';
import { setNotification } from 'common/notification';
import { LocationRequestTemplate } from './LocationRequestTemplate/LocationRequestTemplate';

export interface ChatMessageProps {
  id: number;
  body: string;
  entityId: number;
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
  groups?: boolean;
  status?: string;
  contact?: any;
}

export const ChatMessage = ({
  id,
  popup,
  focus,
  sender,
  entityId,
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
  groups,
  status,
  contact,
}: ChatMessageProps) => {
  const [showSaveMessageDialog, setShowSaveMessageDialog] = useState(false);
  const Ref = useRef(null);
  const messageRef = useRef<null | HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const { t } = useTranslation();

  const open = Boolean(anchorEl);
  const popperId = open ? 'simple-popper' : undefined;

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

  let iconLeft = false;
  let placement: any = 'bottom-end';
  let additionalClass = styles.Mine;
  let mineColor: string | null = styles.MineColor;
  let iconPlacement = styles.ButtonLeft;
  let datePlacement: string | null = styles.DateLeft;
  let labelContainer: string | null = styles.LabelContainerSender;
  let labelMargin: string | null = styles.LabelMargin;
  let messageDetails = styles.MessageDetails;
  const messageError = errors ? parseTextMethod(errors) : {};
  let messageErrorStatus: any = false;
  let tooltipTitle: any = dayjs(insertedAt).format(SHORT_DATE_FORMAT);

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
    let messageStatus: any;

    if (Object.prototype.hasOwnProperty.call(messageErrorStatus, 'message')) {
      messageStatus = messageErrorStatus.message;
    } else {
      messageStatus = messageErrorStatus[0];
    }

    tooltipTitle = (
      <>
        {tooltipTitle}
        <div className={styles.ErrorMessage}>{messageStatus}</div>
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

  let isSender: boolean;
  if (groups) {
    isSender = status === 'received';
  } else {
    isSender = sender.id === entityId;
  }

  if (isSender) {
    additionalClass = styles.Other;
    mineColor = styles.OtherColor;
    iconLeft = true;
    placement = 'bottom-start';
    iconPlacement = styles.ButtonRight;
    datePlacement = null;
    labelContainer = null;
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
    const testForValidUrl = new RegExp(VALID_URL_REGEX, 'gi');
    const mediaUrl = media.url + downloadExtension();
    if (testForValidUrl.test(mediaUrl)) {
      const link = document.createElement('a');
      link.href = mediaUrl;
      link.setAttribute('download', link.href);
      document.body.appendChild(link);
      link.click();
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    } else {
      setNotification('Error! Invalid media url', 'warning');
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

  let messageFooter;

  messageFooter = dayjs(insertedAt).format(SHORT_TIME_FORMAT);

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
        <p className={styles.DaySeparatorContent}>{dayjs(insertedAt).format(SHORT_DATE_FORMAT)}</p>
      </div>
    );
  }

  const icon = (
    <div ref={Ref} className={`${styles.Button} ${iconPlacement}`}>
      <MessageIcon onClick={onClick} data-testid="messageOptions" />
    </div>
  );

  const ErrorIcon = messageErrorStatus ? (
    <Tooltip
      title={tooltipTitle}
      placement={isSender ? 'right' : 'left'}
      tooltipClass={styles.ErrorMessage}
      tooltipArrowClass={styles.ArrowTooltip}
    >
      <WarningIcon className={styles.ErrorMsgIcon} data-testid="warning-icon" />
    </Tooltip>
  ) : null;

  const { body: bodyText, buttons: templateButtons } = WhatsAppTemplateButton(body);

  const content: any = interactiveContent ? JSON.parse(interactiveContent) : null;
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
  if (type === LIST) {
    template = <ListReplyTemplate {...content} disabled component={ChatTemplate} />;
  }

  if (type === QUICK_REPLY) {
    template = <QuickReplyTemplate {...content} disabled />;
  }

  if (type === LOCATION_REQUEST) {
    template = <LocationRequestTemplate content={content} disabled />;
  }

  let displayLabel;
  if (flowLabel) {
    const labels = flowLabel.split(',');
    if (labels.length > 0) {
      displayLabel = labels.map((label: string) => (
        <div key={label} className={`${styles.Label} ${labelMargin}`} data-testid="labels">
          <LabelIcon className={styles.LabelIcon} stroke="#073f24" />
          {label}
        </div>
      ));
    }
  }

  let contactName: any;
  if (groups && isSender) {
    contactName = <div className={styles.ContactName}>{contact?.name}</div>;
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
          <Tooltip
            title={dayjs(contextMessage.insertedAt).format(SHORT_DATE_FORMAT)}
            placement="right"
          >
            <div
              className={styles.ReplyMessage}
              onClick={() => jumpToMessage(contextMessage.messageNumber)}
              aria-hidden="true"
              data-testid="reply-message"
            >
              <div className={styles.ReplyMainWrap}>
                <div>
                  <div className={styles.ReplyContact}>
                    {contextMessage.sender.id === entityId ? contextMessage.sender.name : 'You'}
                  </div>
                  <div className={styles.ReplyMessageBody}>
                    <ChatMessageType
                      type={contextMessage.type}
                      media={contextMessage.media}
                      body={contextMessage.body}
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
          {iconLeft && icon}
          {ErrorIcon}
          <div className={chatMessageClasses.join(' ')}>
            <Tooltip title={tooltipTitle} placement={isSender ? 'right' : 'left'}>
              <div>
                <div className={chatMessageContent.join(' ')} data-testid="content">
                  {isInteractiveContentPresent && !isSender ? (
                    template
                  ) : (
                    <>
                      {contactName}
                      <ChatMessageType
                        type={type}
                        media={media}
                        body={bodyText}
                        location={location}
                        isSender={isSender}
                      />
                      {dateAndSendBy}
                    </>
                  )}
                </div>
              </div>
            </Tooltip>

            <Popper
              id={popperId}
              open={open}
              modifiers={[
                {
                  name: 'preventOverflow',
                  options: {
                    altBoundary: true,
                  },
                },
              ]}
              anchorEl={anchorEl}
              placement={placement}
              transition
              data-testid="popup"
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                  <Paper elevation={3}>
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
        <div className={styles.SendBy}>{sendBy}</div>

        {saveTemplateMessage}

        <div className={messageDetails}>
          <div className={`${messageErrorStatus ? styles.TemplateButtonOnError : ''}`}>
            {templateButtons && <TemplateButtons template={templateButtons} />}
          </div>

          {displayLabel ? (
            <div className={`${styles.LabelContainer} ${labelContainer}`}>{displayLabel}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
