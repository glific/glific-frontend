import React, { useState, useRef } from 'react';
import { Fab, Box, TextField, IconButton, Drawer } from '@mui/material';
import { Send as SendIcon, Close as CloseIcon, Psychology as PsychologyIcon } from '@mui/icons-material';
import styles from './AskMeBot.module.css';
import Logo from 'assets/images/logo/glific-logo.svg?react';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

// Custom Green Bot Logo Component
const BotLogo = ({ size = 40 }: { size?: number }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #00C851 0%, #007E33 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      boxShadow: '0 4px 20px rgba(0, 200, 81, 0.3)',
      '&::before': {
        content: '""',
        position: 'absolute',
        width: '85%',
        height: '85%',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
        opacity: 0.7,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: '60%',
        height: '60%',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #A5D6A7 0%, #C8E6C9 100%)',
        opacity: 0.5,
      },
    }}
  >
    <PsychologyIcon
      sx={{
        color: 'white',
        fontSize: size * 0.6,
        zIndex: 1,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
      }}
    />
  </Box>
);

export const AskMeBot = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const fabRef = useRef<HTMLButtonElement>(null);

  const quickSuggestions = [
    'How do I create a flow?',
    'Explain contact groups',
    'Show me templates',
    'Campaign setup help',
    'Analytics overview',
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      const newUserMessage: Message = {
        id: Date.now(),
        text: message,
        isBot: false,
        timestamp: new Date(),
      };

      // Green-themed personality responses
      let response;

      if (message.toLowerCase().includes('flow')) {
        response =
          'Flows are like digital ecosystems! 🌿 They create natural conversation paths that guide your users through meaningful interactions. Want me to help you plant your first flow and watch it grow?';
      } else if (message.toLowerCase().includes('contact')) {
        response =
          'Contact management is like tending a garden! 🌺 You nurture relationships, group similar contacts like flower beds, and watch your community bloom. Shall I show you how to cultivate your contact ecosystem?';
      } else if (message.toLowerCase().includes('template')) {
        response =
          "Templates are your message seeds! 🌱 Plant them wisely and they'll grow into beautiful, WhatsApp-approved communications that reach your audience. Ready to start your template garden?";
      } else if (message.toLowerCase().includes('campaign')) {
        response =
          'Campaigns are like seasonal harvests! 🍃 You prepare the ground, plant your messages, and reap the engagement. Let me guide you through creating campaigns that flourish!';
      } else if (message.toLowerCase().includes('analytics')) {
        response =
          "Analytics are like soil reports for your digital garden! 📊🌱 They tell you what's thriving, what needs attention, and how to optimize your growth. Want to dig into the data together?";
      } else {
        response =
          "I'm here to help your Glific journey flourish! 🌟 Whether it's flows, contacts, templates, or campaigns, I'll help you grow your automation skills naturally. What aspect would you like to explore?";
      }

      const newBotMessage: Message = {
        id: Date.now() + 1,
        text: response,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newUserMessage, newBotMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  return (
    <>
      {/* Green Floating Action Button */}
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
          <BotLogo size={32} />
        </Fab>
      )}

      {/* Side Drawer Chat */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            top: 'auto',
            bottom: '0 !important',
            height: '80vh',
            width: '400px',
            maxWidth: '800px',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(180deg, #F1F8E9 0%, #E8F5E8 100%)',
          },
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
          <div className={styles.Messages}>{}</div>
          <div className={styles.SuggestionsContainer}>
            {messages.length === 0 &&
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
                    <IconButton className={styles.SendButton} onClick={handleSendMessage} disabled={!message.trim()}>
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
            {/* <input name="message" value={message} /> */}
          </div>
        </div>
      </Drawer>
    </>
  );
};
