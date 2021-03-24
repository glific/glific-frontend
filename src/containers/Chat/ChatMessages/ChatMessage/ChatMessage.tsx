import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useApolloClient } from '@apollo/client';
import Popper from '@material-ui/core/Popper';
import { Button } from '@material-ui/core';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';

import styles from './ChatMessage.module.css';
import { ReactComponent as TagIcon } from '../../../../assets/images/icons/Tags/Filled.svg';
import { ReactComponent as WarningIcon } from '../../../../assets/images/icons/Warning.svg';
import { ReactComponent as MessageIcon } from '../../../../assets/images/icons/Dropdown.svg';
import { ReactComponent as CloseIcon } from '../../../../assets/images/icons/Close.svg';
import { AddToMessageTemplate } from '../AddToMessageTemplate/AddToMessageTemplate';
import { DATE_FORMAT, TIME_FORMAT } from '../../../../common/constants';
import { UPDATE_MESSAGE_TAGS } from '../../../../graphql/mutations/Chat';
import { setNotification } from '../../../../common/notification';
import { WhatsAppToJsx } from '../../../../common/RichEditor';
import { ChatMessageType } from './ChatMessageType/ChatMessageType';
import { Tooltip } from '../../../../components/UI/Tooltip/Tooltip';
import { parseTextMethod } from '../../../../common/utils';

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
}

export const ChatMessage: React.SFC<ChatMessageProps> = (props) => {
  const client = useApolloClient();
  const [showSaveMessageDialog, setShowSaveMessageDialog] = useState(false);
  const Ref = useRef(null);

  const messageRef = useRef<null | HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const popperId = open ? 'simple-popper' : undefined;
  let displayTag: any;
  let deleteId: string | number;
  const {
    popup,
    focus,
    sender,
    contactId,
    tags,
    showMessage,
    insertedAt,
    onClick,
    type,
    media,
    body,
    messageNumber,
    location,
    errors,
  } = props;

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
  const [deleteTag] = useMutation(UPDATE_MESSAGE_TAGS, {
    onCompleted: () => {
      setNotification(client, 'Tag deleted successfully');
    },
  });

  let iconLeft = false;
  let placement: any = 'bottom-end';
  let additionalClass = styles.Mine;
  let mineColor: string | null = styles.MineColor;
  let iconPlacement = styles.ButtonLeft;
  let datePlacement: string | null = styles.DateLeft;
  let tagContainer: string | null = styles.TagContainerSender;
  let tagMargin: string | null = styles.TagMargin;
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
    tagContainer = null;
    tagMargin = null;
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
    switch (props.type) {
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
    link.href = props.media.url + downloadExtension();
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
        id={props.id}
        message={WhatsAppToJsx(props.body)}
        changeDisplay={saveMessageTemplate}
      />
    );
  }

  const deleteTagHandler = (event: any) => {
    deleteId = event.currentTarget.getAttribute('data-id');
    deleteTag({
      variables: {
        input: {
          messageId: props.id,
          addTagIds: [],
          deleteTagIds: [deleteId],
        },
      },
    });
  };

  if (tags && tags.length > 0)
    displayTag = tags.map((tag: any) => (
      <div
        key={tag.id}
        className={`${styles.Tag} ${tagMargin}`}
        style={{ color: tag.colorCode }}
        data-testid="tags"
      >
        <TagIcon className={styles.TagIcon} stroke={tag.colorCode ? tag.colorCode : '#0C976D'} />
        {tag.label}
        <CloseIcon
          className={styles.CloseIcon}
          onClick={deleteTagHandler}
          data-id={tag.id}
          data-testid="deleteIcon"
        />
      </div>
    ));

  const date = showMessage ? (
    <div className={`${styles.Date} ${datePlacement}`} data-testid="date">
      {moment(insertedAt).format(TIME_FORMAT)}
    </div>
  ) : null;

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
      title="Something went wrong! This message could not be sent"
      placement={isSender ? 'right' : 'left'}
      tooltipClass={styles.WarningTooltip}
      tooltipArrowClass={styles.ArrowTooltip}
    >
      <WarningIcon className={styles.ErrorMsgIcon} />
    </Tooltip>
  ) : null;

  return (
    <div
      className={additionalClass}
      ref={messageRef}
      data-testid="message"
      id={`search${messageNumber}`}
    >
      <div className={styles.Inline}>
        {iconLeft ? icon : null}
        {ErrorIcon}
        <div
          className={`${styles.ChatMessage} ${mineColor} ${
            type === 'STICKER' ? styles.StickerBackground : ''
          }`}
        >
          <Tooltip title={tooltipTitle} placement={isSender ? 'right' : 'left'}>
            <div
              className={`${styles.Content} ${messageErrorStatus ? styles.ErrorContent : ''}`}
              data-testid="content"
            >
              <div>
                <ChatMessageType
                  type={type}
                  media={media}
                  body={body}
                  insertedAt={insertedAt}
                  location={location}
                />
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
                  <Button
                    className={styles.Popper}
                    color="primary"
                    onClick={props.setDialog}
                    data-testid="dialogButton"
                  >
                    Assign tag
                  </Button>
                  <br />
                  <Button
                    className={styles.Popper}
                    color="primary"
                    onClick={() => setShowSaveMessageDialog(true)}
                  >
                    Add to speed sends
                  </Button>
                  {props.type !== 'TEXT' && (
                    <span>
                      <br />
                      <Button
                        className={styles.Popper}
                        color="primary"
                        onClick={() => downloadMedia()}
                        data-testid="downloadMedia"
                      >
                        Download media
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
        {date}
        {displayTag ? (
          <div className={`${styles.TagContainer} ${tagContainer}`}>{displayTag}</div>
        ) : null}
      </div>
    </div>
  );
};

export default ChatMessage;
