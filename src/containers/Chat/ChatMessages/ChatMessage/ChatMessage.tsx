import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { ReactComponent as TagIcon } from '../../../../assets/images/icons/Tags/Selected.svg';
import Popper from '@material-ui/core/Popper';
import { Button } from '@material-ui/core';
import { ReactComponent as MessageIcon } from '../../../../assets/images/icons/Dropdown.svg';
import { ReactComponent as CloseIcon } from '../../../../assets/images/icons/Close.svg';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import AddToMessageTemplate from '../AddToMessageTemplate/AddToMessageTemplate';
import { Tooltip } from '../../../../components/UI/Tooltip/Tooltip';
import styles from './ChatMessage.module.css';
import { useMutation, useApolloClient } from '@apollo/client';
import { DATE_FORMAT, TIME_FORMAT } from '../../../../common/constants';
import { UPDATE_MESSAGE_TAGS, MESSAGE_FRAGMENT } from '../../../../graphql/mutations/Chat';
import { setNotification } from '../../../../common/notification';
import { TextReplacements } from '../../../../common/RichEditor';

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
  insertedAt: string;
  onClick?: any;
  tags: Array<any>;
  popup: any;
  setDialog?: any;
  focus?: boolean;
  showMessage: boolean;
}

export const ChatMessage: React.SFC<ChatMessageProps> = (props) => {
  const client = useApolloClient();
  const [showSaveMessageDialog, setShowSaveMessageDialog] = useState(false);
  const Ref = useRef(null);
  const messageRef = useRef<null | HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const popperId = open ? 'simple-popper' : undefined;
  let tag: any;
  let deleteId: string | number;
  const reactStringReplace = require('react-string-replace');

  const { popup, focus, id } = props;

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
  }, [focus, id]);

  const [deleteTag] = useMutation(UPDATE_MESSAGE_TAGS, {
    update: (cache) => {
      const tags = client.readFragment({
        id: `Message:${props.id}`,
        fragment: MESSAGE_FRAGMENT,
      });
      if (tags) {
        const tagsCopy = JSON.parse(JSON.stringify(tags));
        tagsCopy.tags = tagsCopy.tags.filter((tag: any) => tag.id !== deleteId);
        cache.writeFragment({
          id: `Message:${props.id}`,
          fragment: MESSAGE_FRAGMENT,
          data: tagsCopy,
        });
      }
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

  if (props.sender.id === props.contactId) {
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

  let saveTemplateMessage;
  if (showSaveMessageDialog) {
    saveTemplateMessage = (
      <AddToMessageTemplate
        id={props.id}
        message={props.body}
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

  if (props.tags && props.tags.length > 0)
    tag = props.tags.map((tag: any) => {
      return (
        <div key={tag.id} className={`${styles.Tag} ${tagMargin}`} data-testid="tags">
          <TagIcon className={styles.TagIcon} />
          {tag.label}
          <CloseIcon
            className={styles.CloseIcon}
            onClick={deleteTagHandler}
            data-id={tag.id}
            data-testid="deleteIcon"
          />
        </div>
      );
    });

  const date = props.showMessage ? (
    <div className={`${styles.Date} ${datePlacement}`} data-testid="date">
      {moment(props.insertedAt).format(TIME_FORMAT)}
    </div>
  ) : null;

  const icon = (
    <MessageIcon
      onClick={props.onClick}
      ref={Ref}
      className={`${styles.Button} ${iconPlacement}`}
      data-testid="messageOptions"
    />
  );

  // Converts WhatsApp message formatting into HTML elements.
  const textConverter = (text: any) => {
    let replacements = TextReplacements;
    for (let i = 0; i < replacements.length; i++) {
      let type = Object.keys(replacements[i])[0];
      let character: any = replacements[i][type].char;
      let replaceFunc: any = replacements[i][type].replace;
      // let regexStr = `\\${character}{${character.length}}(.+?)\\${character}{${character.length}}`;
      let regexStr =
        '\\' +
        character +
        '{' +
        character.length +
        '}(.+?)\\' +
        character +
        '{' +
        character.length +
        '}';
      text = reactStringReplace(text, new RegExp(regexStr, 'g'), (match: any, i: number) =>
        replaceFunc(match)
      );
    }
    return text;
  };

  return (
    <div className={additionalClass} ref={messageRef} data-testid="message">
      <div className={styles.Inline}>
        {iconLeft ? icon : null}
        <div className={`${styles.ChatMessage} ${mineColor}`}>
          <Tooltip title={moment(props.insertedAt).format(DATE_FORMAT)} placement="right">
            <div className={styles.Content} data-testid="content">
              <div>{textConverter(props.body)}</div>
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
        {tag ? <div className={`${styles.TagContainer} ${tagContainer}`}>{tag}</div> : null}
      </div>
    </div>
  );
};

export default ChatMessage;
