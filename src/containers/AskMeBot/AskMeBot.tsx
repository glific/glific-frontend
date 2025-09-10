import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { Divider, Drawer, Fab, IconButton, TextField, Tooltip } from '@mui/material';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';

import AskMeBotIcon from 'assets/images/AskMeBot.svg?react';
import Logo from 'assets/images/logo/glific-logo.svg?react';
import { ASK_ME_BOT_ENDPOINT } from 'config';
import { getAuthSession } from 'services/AuthService';
import styles from './AskMeBot.module.css';

interface Message {
  role: 'user' | 'system' | 'error';
  content: string;
  timestamp?: Date;
  prompt?: boolean;
}

interface StoredMessages {
  messages: Message[];
  createdAt: string;
}

const MESSAGE_EXPIRY_HOURS = 24;

export const AskMeBot = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThreadExpiredState, setIsThreadExpiredState] = useState(false);

  const fabRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, open]);

  const isThreadExpired = (createdAt: string): boolean => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff >= MESSAGE_EXPIRY_HOURS;
  };

  const handleOk = () => {
    const userMessage: any = { role: 'user', content: message, timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage('');
    handleSendMessage(userMessage, updatedMessages);
  };

  const handleKeyDown = (event: any) => {
    if (event?.key === 'Enter' && message.trim()) {
      handleOk();
    }
  };

  const handleSendMessage = async (message: any, currentMessages = messages) => {
    setIsLoading(true);

    // If thread is expired, only send system prompt + current user message
    let messagesToSend;
    if (isThreadExpiredState) {
      messagesToSend = [{ role: message.role, content: message.content }];
    } else {
      const cleanedMessages = currentMessages.map(({ prompt, timestamp, ...rest }) => rest);
      // sending only last 10 messages
      messagesToSend = cleanedMessages.slice(-10);
    }

    try {
      const response = await axios.post(
        ASK_ME_BOT_ENDPOINT,
        {
          input: messagesToSend.filter((message) => message.role === 'user' || message.role === 'system'),
        },
        {
          headers: {
            Authorization: getAuthSession('access_token'),
            'Content-Type': 'application/json',
          },
        }
      );

      const newMessages: Message[] = [
        ...currentMessages,
        {
          role: 'system',
          content: response.data.response,
          timestamp: new Date(),
        },
      ];

      setMessages(newMessages);

      if (isThreadExpiredState) {
        setIsThreadExpiredState(false);
      }

      return response.data;
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'error',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages([...currentMessages, errorMessage]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const quickSuggestions = ['What are HSM Messages?', 'Best practices To create a flow', 'What is session window?'];

  useEffect(() => {
    const localStorageData = localStorage.getItem('askMeBotHistory');
    if (localStorageData) {
      try {
        const storedData: StoredMessages = JSON.parse(localStorageData);
        if (isThreadExpired(storedData.createdAt)) {
          setMessages(storedData.messages);
          setIsThreadExpiredState(true);
        } else {
          setMessages(storedData.messages);
          setIsThreadExpiredState(false);
        }
      } catch (error) {
        console.error('Error parsing stored messages:', error);

        const newMessages: Message[] = [];
        setMessages(newMessages);
        setIsThreadExpiredState(false);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1 || !messages[0]?.prompt) {
      const dataToStore: StoredMessages = {
        messages,
        createdAt: isThreadExpiredState
          ? new Date().toISOString()
          : JSON.parse(localStorage.getItem('askMeBotHistory') || '{}').createdAt || new Date().toISOString(),
      };
      localStorage.setItem('askMeBotHistory', JSON.stringify(dataToStore));
    }
  }, [messages, isThreadExpiredState]);

  return (
    <>
      {open ? null : (
        <Tooltip title="Ask Glific" placement="left" arrow>
          <Fab
            data-testid="ask-me-bot-fab"
            ref={fabRef}
            color="primary"
            aria-label="ask me bot"
            onClick={() => setOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              background: 'linear-gradient(135deg, #00C851 0%, #007E33 100%)',
              cursor: 'pointer',
              '&:hover': {
                background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                transform: 'scale(1.1)',
              },
              transition: 'transform 0.2s ease-in-out',
              zIndex: 1300,
              boxShadow: '0 8px 32px rgba(0, 200, 81, 0.4)',
            }}
          >
            <AskMeBotIcon />
          </Fab>
        </Tooltip>
      )}

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              top: 'auto',
              bottom: '0 !important',
              height: '80vh',
              width: '400px',
              maxWidth: '800px',
              display: 'flex',
              flexDirection: 'column',
              borderTopLeftRadius: '1rem',
              pointerEvents: 'auto',
            },
          },
          root: {
            hideBackdrop: true,
          },
        }}
        ModalProps={{
          hideBackdrop: true,
          style: { pointerEvents: 'none' },
        }}
      >
        <div className={styles.Container}>
          <div className={styles.Header}>
            <span>
              <span className={styles.LogoContainer}>
                <Logo />
              </span>
              Ask Glific
            </span>
            <CloseIcon data-testid="close-icon" onClick={() => setOpen(false)} />
          </div>
          <div className={styles.Messages}>
            {messages
              .filter((i) => !i.prompt)
              .map((message) => (
                <div
                  key={`${message?.timestamp?.toString()}-${message?.content?.slice(0, 5)}`}
                  className={`${message?.role === 'user' ? styles.User : styles.System}`}
                >
                  <Markdown
                    components={{
                      a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                    }}
                  >
                    {message?.content}
                  </Markdown>
                </div>
              ))}
            {isLoading && (
              <div className={styles.LoaderContainer}>
                <div data-testid="loading" className={styles.Loader} />
              </div>
            )}
            {isThreadExpiredState && !isLoading && (
              <Divider
                sx={{
                  boxShadow: 'none',
                }}
              >
                <span className={styles.Divider}>Conversation Expired. Start a new conversation.</span>
              </Divider>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.SuggestionsContainer}>
            {messages.length <= 1 &&
              !isLoading &&
              quickSuggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  data-testid="suggestion"
                  onClick={() => setMessage(suggestion)}
                  className={styles.Suggestion}
                >
                  {suggestion}
                </div>
              ))}
          </div>
          <div className={styles.InputContainer}>
            <TextField
              data-testid="textbox"
              name="message"
              value={message}
              onKeyDown={handleKeyDown}
              slotProps={{
                input: {
                  endAdornment: (
                    <IconButton
                      className={styles.SendButton}
                      onKeyDown={handleKeyDown}
                      onClick={handleOk}
                      disabled={!message.trim()}
                    >
                      <SendIcon data-testid="send-icon" color="primary" />
                    </IconButton>
                  ),
                },
              }}
              autoFocus
              onChange={(event) => setMessage(event.target.value)}
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'white',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover fieldset': {
                    border: 'none',
                  },
                  '&.Mui-focused fieldset': {
                    border: 'none',
                  },
                },
              }}
            />
          </div>
        </div>
      </Drawer>
    </>
  );
};
