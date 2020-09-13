import React, { useState } from 'react';
import { EditorState, ContentState } from 'draft-js';
import { Container, Button, ClickAwayListener, Fade } from '@material-ui/core';
import 'emoji-mart/css/emoji-mart.css';
import clsx from 'clsx';

import { convertToWhatsApp, WhatsAppToDraftEditor } from '../../../../common/RichEditor';
import styles from './ChatInput.module.css';
import sendMessageIcon from '../../../../assets/images/icons/SendMessage.svg';
import SearchBar from '../../../../components/UI/SearchBar/SearchBar';
import ChatTemplates from '../ChatTemplates/ChatTemplates';
import WhatsAppEditor from '../../../../components/UI/Form/WhatsAppEditor/WhatsAppEditor';

export interface ChatInputProps {
  onSendMessage(content: string): any;
  handleHeightChange(newHeight: number): void;
}

export const ChatInput: React.SFC<ChatInputProps> = (props) => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [selectedTab, setSelectedTab] = useState('');
  const [open, setOpen] = React.useState(false);
  const [searchVal, setSearchVal] = useState('');
  const speedSends = 'Speed sends';
  const templates = 'Templates';

  const submitMessage = (message: string) => {
    if (!message) return;

    // Resetting the EditorState
    setEditorState(
      EditorState.moveFocusToEnd(
        EditorState.push(editorState, ContentState.createFromText(''), 'remove-range')
      )
    );
    props.onSendMessage(message);
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

  const quickSendButtons = () => {
    let types = [speedSends, templates];
    let buttons = types.map((type: string) => {
      return (
        <div
          key={type}
          data-testid="shortcut-button"
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
      <div
        className={clsx(styles.ChatInputElements, {
          [styles.Unrounded]: selectedTab !== '',
          [styles.Rounded]: selectedTab === '',
        })}
      >
        <WhatsAppEditor
          data-testid="message-input"
          editorState={editorState}
          setEditorState={setEditorState}
          sendMessage={submitMessage}
          handleHeightChange={props.handleHeightChange}
        />
        <div className={styles.SendButtonContainer}>
          <Button
            className={styles.SendButton}
            data-testid="send-button"
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => submitMessage(convertToWhatsApp(editorState))}
            disabled={!editorState.getCurrentContent().hasText()}
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
