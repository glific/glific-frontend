import React, { useState } from 'react';
import IconButton from '@material-ui/core/IconButton';
import { Container, Button, ClickAwayListener, Fade } from '@material-ui/core';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import clsx from 'clsx';
import styles from './ChatInput.module.css';
import sendMessageIcon from '../../../../assets/images/icons/SendMessage.svg';
import { SearchBar } from '../../ChatConversations/SearchBar';
import ChatTemplates from '../ChatTemplates/ChatTemplates';

export interface ChatInputProps {
  onSendMessage(content: string): any;
}

export const ChatInput: React.SFC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [searchVal, setSearchVal] = useState('');
  const speedSends = 'Speed sends';
  const templates = 'Templates';

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

  const handleClick = (title: string) => {
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
    setMessage(obj.body);
  };

  const handleSearch = (e: any) => {
    setSearchVal(e.target.value);
  };

  const quickSendButtons = () => {
    let types = [speedSends, templates];
    let buttons = types.map((type: string) => {
      return (
        <div
          onClick={() => handleClick(type)}
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

  return (
    <Container className={styles.ChatInput}>
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
                />
              </div>
            </Fade>
          ) : null}
          {quickSendButtons()}
        </div>
      </ClickAwayListener>
      <div className={styles.ChatInputElements}>
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
