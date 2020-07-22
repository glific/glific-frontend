import React, { useState, useRef } from 'react';
import IconButton from '@material-ui/core/IconButton';
import {
  Container,
  Button,
  List,
  ListItem,
  Typography,
  Grid,
  Fade,
  Paper,
  Popover,
} from '@material-ui/core';
import Popper, { PopperPlacementType } from '@material-ui/core/Popper';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import clsx from 'clsx';
import styles from './ChatInput.module.css';
import sendMessageIcon from '../../../../assets/images/icons/SendMessage.svg';
import { SearchBar } from '../../ChatConversations/SearchBar';

export interface ChatInputProps {
  onSendMessage(content: string): any;
}

export const ChatInput: React.SFC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const speedSends = 'Speed sends';
  const templates = 'Templates';
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] = React.useState<PopperPlacementType>();
  const quickSend = useRef(null);

  const keyPressHandler = (e: any) => {
    if (e.key === 'Enter') {
      submitMessage();
    }
  };

  const changeHandler = ({ target }: any) => {
    setMessage(target.value);
  };

  const submitMessage = () => {
    // close emoji picker
    setShowEmojiPicker(false);

    if (!message) return;

    setMessage('');

    if (typeof onSendMessage === 'function') {
      onSendMessage(message);
    }
  };

  let emojiPicker;
  if (showEmojiPicker) {
    emojiPicker = (
      <Picker
        data-testid="emoji-popup"
        title="Pick your emoji…"
        emoji="point_up"
        style={{ position: 'absolute', bottom: '190px', right: '444px' }}
        onSelect={(emoji: any) => setMessage(message + emoji.native)}
      />
    );
  }

  const dummy = [
    {
      title: 'Thank you',
      message: 'Thank you for messaging chief.',
    },
    {
      title: 'Help',
      message: 'Help pls thank you!',
    },
  ];

  const handleClick = (event: any, newPlacement: PopperPlacementType, title: string) => {
    if (selectedTab === title) {
      setSelectedTab('');
    } else {
      setSelectedTab(title);
    }
    setAnchorEl(quickSend.current);
    setOpen(selectedTab !== title);
    setPlacement(newPlacement);
  };

  return (
    <Container className={styles.ChatInput}>
      {/* <SearchBar onReset={() => console.log('reset')} /> */}
      <div className={styles.SendsContainer}>
        <div
          onClick={(e: any) => handleClick(e, 'top', speedSends)}
          className={clsx(styles.QuickSend, {
            [styles.QuickSendSelected]: selectedTab === speedSends,
          })}
        >
          {speedSends}
        </div>
        <div
          onClick={(e: any) => handleClick(e, 'top', templates)}
          className={clsx(styles.QuickSend, {
            [styles.QuickSendSelected]: selectedTab === templates,
          })}
        >
          {templates}
        </div>
      </div>
      <div ref={quickSend} className={styles.ChatInputElements}>
        <Popper
          className={styles.Popper}
          open={true}
          disablePortal
          anchorEl={anchorEl}
          placement={placement}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={150}>
              <Paper elevation={0} className={styles.ShortcutPaper}>
                <List className={styles.ShortcutList}>
                  <ListItem button>Hi there!</ListItem>
                  <ListItem>
                    <b>Help:</b> Lorem!!
                  </ListItem>
                </List>
              </Paper>
            </Fade>
          )}
        </Popper>
        <div className={styles.InputContainer}>
          <input
            className={styles.InputBox}
            data-testid="message-input"
            type="text"
            placeholder="Start typing..."
            value={message}
            onKeyPress={keyPressHandler}
            onChange={changeHandler}
            onClick={() => setShowEmojiPicker(false)}
          />
        </div>
        <div className={styles.EmojiContainer}>
          <IconButton
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
        </div>
        <div className={styles.SendButtonContainer}>
          <Button
            className={styles.SendButton}
            data-testid="send-button"
            variant="contained"
            color="primary"
            onClick={submitMessage}
            disabled={message.length === 0}
          >
            Send
            <img className={styles.SendIcon} src={sendMessageIcon} alt="Send Message" />
          </Button>
        </div>
      </div>
      {emojiPicker}
    </Container>
  );
};

export default ChatInput;
