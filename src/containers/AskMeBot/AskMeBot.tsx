import { Close as CloseIcon, Send as SendIcon } from '@mui/icons-material';
import { Drawer, Fab, IconButton, TextField } from '@mui/material';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';

import AskMeBotIcon from 'assets/images/AskMeBot.svg?react';
import Logo from 'assets/images/logo/glific-logo.svg?react';
import styles from './AskMeBot.module.css';
import { prompt } from './system-prompt';

interface Message {
  role: 'user' | 'system';
  content: string;
  timestamp?: Date;
  prompt?: boolean;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

export const AskMeBot = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([{ role: 'system', content: prompt, prompt: true }]);
  const [isLoading, setIsLoading] = useState(false);

  const fabRef = useRef<HTMLButtonElement>(null);

  const handleOk = () => {
    const messag: any = { role: 'user', content: message };
    const updatedMessages = [...messages, messag];
    setMessages(updatedMessages);
    setMessage('');
    handleSendMessage(messag, updatedMessages);
  };

  const handleSendMessage = async (message: any, currentMessages = messages) => {
    setIsLoading(true);
    const input = [...currentMessages.map(({ prompt, ...rest }) => rest), message];
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/responses',
        {
          model: 'gpt-4o',
          input: input,
          tools: [
            {
              type: 'file_search',
              vector_store_ids: ['vs_Fx8ChbH6bkkFeNlLRdLXyOf4'],
              max_num_results: 20,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const newMessages: Message[] = [
        ...currentMessages,
        { role: 'system', content: response.data.output[1].content[0].text },
      ];

      setMessages(newMessages);

      return response.data;
    } catch (error: any) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const quickSuggestions = ['What are HSM Messages?', 'Best practices To create a flow', 'What is session window?'];

  useEffect(() => {
    const localStorageMessages = localStorage.getItem('askMeBotHistory');
    if (localStorageMessages) {
      const messages: any = JSON.parse(localStorageMessages);

      setMessages(messages);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('askMeBotHistory', JSON.stringify(messages));
  }, [messages]);

  return (
    <>
      {open ? null : (
        <Fab
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
              borderTopRightRadius: '1rem',
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
            <CloseIcon onClick={() => setOpen(false)} />
          </div>
          <div className={styles.Messages}>
            {messages
              .filter((i) => !i.prompt)
              .map((message) => (
                <div className={`${message.role === 'system' ? styles.System : styles.User}`}>
                  <Markdown>{message.content}</Markdown>
                </div>
              ))}
            {isLoading && <div className={styles.Loader} />}
          </div>
          <div className={styles.SuggestionsContainer}>
            {messages.length <= 1 &&
              quickSuggestions.map((suggestion, index) => (
                <div onClick={() => setMessage(suggestion)} className={styles.Suggestion}>
                  {suggestion}
                </div>
              ))}
          </div>
          <div className={styles.InputContainer}>
            <TextField
              name="message"
              value={message}
              slotProps={{
                input: {
                  endAdornment: (
                    <IconButton className={styles.SendButton} onClick={handleOk} disabled={!message.trim()}>
                      <SendIcon color="primary" />
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
