import { useMutation, useSubscription } from '@apollo/client';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MinimizeIcon from '@mui/icons-material/Minimize';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SettingsOverscanIcon from '@mui/icons-material/SettingsOverscan';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import { Fab, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';

import AskGlificIcon from 'assets/images/icons/AskGlific/Icon.svg?react';
import EditIcon from 'assets/images/icons/Edit.svg?react';

import { ASK_GLIFIC } from 'graphql/mutations/AskGlific';
import { ASK_GLIFIC_RESPONSE_SUBSCRIPTION } from 'graphql/subscriptions/AskGlific';
import { getUserSession } from 'services/AuthService';
import styles from './AskGlific.module.css';

interface Message {
  role: 'user' | 'system' | 'error';
  content: string;
  timestamp?: Date;
  prompt?: boolean;
  feedback?: 'up' | 'down' | null;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  timeAgo: string;
  date: string;
}

type DisplayMode = 'floating' | 'sidebar' | 'fullscreen';

const QUICK_SUGGESTIONS = [
  'Create your first chatbot',
  'How to use AI Assistants',
  'How to send bulk messages',
  'Run a survey using WA forms',
];

// Mock chat history data — will be replaced with API call
const MOCK_CHAT_HISTORY: ChatHistoryItem[] = [
  { id: '1', title: 'Create Chatbot', timeAgo: '2 mins. ago', date: 'Today' },
  { id: '2', title: 'Testing flows', timeAgo: '10 mins. ago', date: 'Today' },
  { id: '3', title: 'HSM Templates', timeAgo: '2 hours ago', date: 'Today' },
  { id: '4', title: 'Bulk messaging setup', timeAgo: 'Yesterday', date: 'Yesterday' },
];

const AskGlific = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('floating');
  const [displayMenuAnchor, setDisplayMenuAnchor] = useState<null | HTMLElement>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyAnchor, setHistoryAnchor] = useState<null | HTMLElement>(null);
  const [chatHistory] = useState<ChatHistoryItem[]>(MOCK_CHAT_HISTORY);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const waitingForResponse = useRef(false);

  const [askGlific] = useMutation(ASK_GLIFIC);

  // Subscribe to Ask Glific responses via WebSocket
  useSubscription(ASK_GLIFIC_RESPONSE_SUBSCRIPTION, {
    variables: { organizationId: getUserSession('organizationId') },
    onData: ({ data: { data } }) => {
      if (!waitingForResponse.current) return;

      const result = data?.askGlificResponse;
      if (!result) return;

      waitingForResponse.current = false;

      if (result.errors?.length) {
        const errorMsg: Message = {
          role: 'error',
          content: result.errors[0].message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } else {
        const answer = result.answer || 'Sorry, Something went wrong. Please try again.';
        if (result.conversationId) {
          setConversationId(result.conversationId);
        }
        const systemMsg: Message = {
          role: 'system',
          content: answer,
          timestamp: new Date(),
          feedback: null,
        };
        setMessages((prev) => [...prev, systemMsg]);
      }

      setIsLoading(false);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, open]);

  const handleSendMessage = async (msg: Message, currentMessages = messages) => {
    setIsLoading(true);
    waitingForResponse.current = true;

    try {
      // Send mutation — returns immediately with answer: null
      // Real answer arrives via the subscription above
      await askGlific({
        variables: {
          input: {
            query: msg.content,
            conversationId: conversationId || '',
          },
        },
      });
    } catch {
      waitingForResponse.current = false;
      const errorMessage: Message = {
        role: 'error',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages([...currentMessages, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleOk = () => {
    if (!message.trim()) return;
    const userMessage: Message = { role: 'user', content: message, timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessage('');
    handleSendMessage(userMessage, updatedMessages);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const userMessage: Message = { role: 'user', content: suggestion, timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    handleSendMessage(userMessage, updatedMessages);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey && message.trim()) {
      event.preventDefault();
      handleOk();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  const handleFeedback = (index: number, type: 'up' | 'down') => {
    setMessages((prev) =>
      prev.map((msg, i) => {
        if (i === index) {
          return { ...msg, feedback: msg.feedback === type ? null : type };
        }
        return msg;
      })
    );
  };

  const getChatTitle = (): string => {
    const firstUserMessage = messages.find((m) => m.role === 'user' && !m.prompt);
    if (!firstUserMessage) return 'New chat';
    const title = firstUserMessage.content;
    return title.length > 20 ? `${title.slice(0, 20)}...` : title;
  };

  const hasMessages = messages.filter((m) => !m.prompt).length > 0;
  const isExpandedMode = displayMode === 'sidebar' || displayMode === 'fullscreen';

  // Group chat history by date
  const groupedHistory = chatHistory.reduce<Record<string, ChatHistoryItem[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 120)} px`;
    }
  }, [message]);

  const wrapperClassMap: Record<string, string> = {
    sidebar: styles.SidebarWrapper,
    fullscreen: styles.FullscreenWrapper,
  };
  const wrapperClass = wrapperClassMap[displayMode] || styles.FloatingWrapper;

  return (
    <>
      {!open && (
        <Tooltip title="Ask Glific" placement="left" arrow>
          <Fab
            data-testid="ask-glific-fab"
            color="primary"
            aria-label="ask glific"
            onClick={() => setOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              background: '#119656',
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              zIndex: 1300,
              boxShadow: '0 8px 32px rgba(0, 200, 81, 0.4)',
            }}
          >
            <AskGlificIcon />
          </Fab>
        </Tooltip>
      )}

      {open && (
        <div className={wrapperClass} data-testid="ask-me-bot-panel">
          {/* Chat History Side Panel — sidebar/fullscreen only */}
          {isExpandedMode && showHistory && (
            <div className={styles.HistoryPanel} data-testid="history-panel">
              <div className={styles.HistoryHeader}>Chat History</div>
              <div className={styles.HistoryList}>
                {Object.entries(groupedHistory).map(([date, items]) => (
                  <div key={date}>
                    <div className={styles.HistoryDateLabel}>{date}</div>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`${styles.HistoryItem} ${item.title === getChatTitle() ? styles.HistoryItemActive : ''}`}
                        onClick={() => setShowHistory(false)}
                      >
                        <div className={styles.HistoryItemContent}>
                          <span className={styles.HistoryItemTitle}>{item.title}</span>
                          <span className={styles.HistoryItemTime}>{item.timeAgo}</span>
                        </div>
                        <IconButton size="small" className={styles.HistoryItemMenu}>
                          <MoreHorizIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.Container}>
            <div className={styles.Header}>
              <div
                className={styles.HeaderLeft}
                onClick={(e) => {
                  if (isExpandedMode) {
                    setShowHistory((prev) => !prev);
                  } else {
                    setHistoryAnchor(historyAnchor ? null : e.currentTarget);
                  }
                }}
              >
                {hasMessages && (
                  <div className={styles.ChatIcon}>
                    <AskGlificIcon />
                  </div>
                )}
                <span>{getChatTitle()}</span>
                <KeyboardArrowDownIcon
                  sx={{
                    fontSize: 20,
                    color: '#888',
                    transform: showHistory || historyAnchor ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </div>

              {/* Chat History Dropdown — floating mode only */}
              <Menu
                anchorEl={historyAnchor}
                open={Boolean(historyAnchor)}
                onClose={() => setHistoryAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                {Object.entries(groupedHistory).map(([date, items]) => [
                  <MenuItem key={`label-${date}`} disabled className={styles.HistoryDropdownDate}>
                    {date}
                  </MenuItem>,
                  ...items.map((item) => (
                    <MenuItem
                      key={item.id}
                      onClick={() => setHistoryAnchor(null)}
                      className={
                        item.title === getChatTitle() ? styles.HistoryDropdownItemActive : styles.HistoryDropdownItem
                      }
                    >
                      {item.title}
                    </MenuItem>
                  )),
                ])}
              </Menu>
              <div className={styles.HeaderRight}>
                <Tooltip title="New chat">
                  <IconButton className={styles.HeaderIconButton} onClick={handleNewChat} data-testid="new-chat-btn">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Display mode">
                  <IconButton
                    className={styles.HeaderIconButton}
                    onClick={(e) => setDisplayMenuAnchor(e.currentTarget)}
                    data-testid="display-mode-btn"
                  >
                    <MoreHorizIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={displayMenuAnchor}
                  open={Boolean(displayMenuAnchor)}
                  onClose={() => setDisplayMenuAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem
                    onClick={() => {
                      setDisplayMode('floating');
                      setDisplayMenuAnchor(null);
                    }}
                    className={displayMode === 'floating' ? styles.DisplayModeItemActive : styles.DisplayModeItem}
                  >
                    <OpenInNewIcon sx={{ fontSize: 18 }} />
                    Floating
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setDisplayMode('sidebar');
                      setDisplayMenuAnchor(null);
                    }}
                    className={displayMode === 'sidebar' ? styles.DisplayModeItemActive : styles.DisplayModeItem}
                  >
                    <WebAssetIcon sx={{ fontSize: 18 }} />
                    Sidebar
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setDisplayMode('fullscreen');
                      setDisplayMenuAnchor(null);
                    }}
                    className={displayMode === 'fullscreen' ? styles.DisplayModeItemActive : styles.DisplayModeItem}
                  >
                    <SettingsOverscanIcon sx={{ fontSize: 18 }} />
                    Fullscreen
                  </MenuItem>
                </Menu>
                {hasMessages ? (
                  <IconButton
                    className={styles.HeaderIconButton}
                    onClick={() => setOpen(false)}
                    data-testid="minimize-btn"
                  >
                    <MinimizeIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                ) : (
                  <IconButton
                    className={styles.HeaderIconButton}
                    onClick={() => setOpen(false)}
                    data-testid="minimize-btn"
                  >
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
              </div>
            </div>

            {/* Welcome section or Messages */}
            {!hasMessages && !isLoading ? (
              <div className={styles.WelcomeSection}>
                <div className={styles.WelcomeIcon}>
                  <AskGlificIcon />
                </div>
                <div className={styles.WelcomeText}>Ask Glific! Learn About How It Works?</div>
                <div className={styles.SuggestionsGrid}>
                  {QUICK_SUGGESTIONS.map((suggestion) => (
                    <div
                      key={suggestion}
                      data-testid="suggestion"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={styles.SuggestionCard}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.Messages}>
                {messages
                  .filter((i) => !i.prompt)
                  .map((msg) => {
                    if (msg.role === 'user') {
                      return (
                        <div key={`${msg.timestamp?.toString()}-${msg.content?.slice(0, 5)}`} className={styles.User}>
                          {msg.content}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={`${msg.timestamp?.toString()}-${msg.content?.slice(0, 5)}`}
                        className={styles.SystemWrapper}
                      >
                        <div className={styles.System}>
                          <Markdown
                            components={{
                              a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                            }}
                          >
                            {msg.content}
                          </Markdown>
                        </div>
                        <div className={styles.FeedbackButtons}>
                          <IconButton
                            className={msg.feedback === 'up' ? styles.FeedbackButtonActive : styles.FeedbackButton}
                            onClick={() => handleFeedback(messages.indexOf(msg), 'up')}
                            data-testid="feedback-up"
                          >
                            <ThumbUpOffAltIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton
                            className={msg.feedback === 'down' ? styles.FeedbackButtonActive : styles.FeedbackButton}
                            onClick={() => handleFeedback(messages.indexOf(msg), 'down')}
                            data-testid="feedback-down"
                          >
                            <ThumbDownOffAltIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </div>
                      </div>
                    );
                  })}
                {isLoading && (
                  <div className={styles.LoadingContainer}>
                    <SettingsOverscanIcon className={styles.LoadingIcon} />
                    <span>thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input */}
            <div className={styles.InputContainer}>
              <div className={styles.InputWrapper}>
                <textarea
                  ref={textAreaRef}
                  data-testid="textbox"
                  className={styles.TextArea}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Glific anything!"
                  rows={1}
                  autoFocus
                />
                <div className={styles.InputFooter}>
                  <div className={styles.InputActions}>
                    <IconButton
                      className={styles.SendButton}
                      onClick={handleOk}
                      disabled={!message.trim()}
                      data-testid="send-icon"
                      size="small"
                    >
                      <ArrowUpwardIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AskGlific;
