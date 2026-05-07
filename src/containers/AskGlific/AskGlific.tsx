import { useLazyQuery, useMutation, useSubscription } from '@apollo/client';
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
import { CircularProgress, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';

import AskGlificIcon from 'assets/images/icons/AskGlific/Icon.svg?react';
import EditIcon from 'assets/images/icons/Edit.svg?react';

import { ASK_GLIFIC, ASK_GLIFIC_FEEDBACK } from 'graphql/mutations/AskGlific';
import { GET_ASK_GLIFIC_CONVERSATIONS, GET_ASK_GLIFIC_MESSAGES } from 'graphql/queries/AskGlific';
import { ASK_GLIFIC_RESPONSE_SUBSCRIPTION } from 'graphql/subscriptions/AskGlific';
import { getUserSession } from 'services/AuthService';
import styles from './AskGlific.module.css';

interface Message {
  role: 'user' | 'system' | 'error';
  content: string;
  timestamp?: Date;
  prompt?: boolean;
  feedback?: 'up' | 'down' | null;
  messageId?: string;
}

interface DifyConversation {
  id: string;
  name: string;
  status: string;
  createdAt: number;
  updatedAt: number;
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

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 172800) return 'Yesterday';
  return new Date(timestamp * 1000).toLocaleDateString();
};

const getDateLabel = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString();
};

const toHistoryItems = (conversations: DifyConversation[]): ChatHistoryItem[] =>
  conversations.map((conv) => ({
    id: conv.id,
    title: conv.name || 'Untitled',
    timeAgo: formatTimeAgo(conv.updatedAt || conv.createdAt),
    date: getDateLabel(conv.updatedAt || conv.createdAt),
  }));

interface AskGlificProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AskGlific = ({ open, setOpen }: AskGlificProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('floating');
  const [displayMenuAnchor, setDisplayMenuAnchor] = useState<null | HTMLElement>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyAnchor, setHistoryAnchor] = useState<null | HTMLElement>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationName, setConversationName] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [hasMoreConversations, setHasMoreConversations] = useState(false);
  const [lastConversationId, setLastConversationId] = useState('');
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [firstMessageId, setFirstMessageId] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [askGlific] = useMutation(ASK_GLIFIC);
  const [submitFeedback] = useMutation(ASK_GLIFIC_FEEDBACK);

  useSubscription(ASK_GLIFIC_RESPONSE_SUBSCRIPTION, {
    variables: { organizationId: getUserSession('organizationId') },
    skip: !open,
    onData: ({ data }) => {
      const result = data?.data?.askGlificResponse;
      if (!result) return;

      if (result.errors?.length) {
        setMessages((prev) => [
          ...prev,
          { role: 'error', content: result.errors[0].message, timestamp: new Date() },
        ]);
        setIsLoading(false);
        return;
      }

      if (result.conversationId) setConversationId(result.conversationId);
      if (result.conversationName) setConversationName(result.conversationName);

      if (result.answer) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'system',
            content: result.answer,
            timestamp: new Date(),
            feedback: null,
            messageId: result.messageId || undefined,
          },
        ]);
      }
      setIsLoading(false);
    },
  });
  const [fetchConversations, { loading: isLoadingConversations }] = useLazyQuery(GET_ASK_GLIFIC_CONVERSATIONS, {
    fetchPolicy: 'network-only',
  });
  const [fetchMessages] = useLazyQuery(GET_ASK_GLIFIC_MESSAGES, {
    fetchPolicy: 'network-only',
  });

  const loadConversations = async (append = false) => {
    const { data } = await fetchConversations({
      variables: { limit: 10, lastId: append ? lastConversationId : '' },
    });
    const result = data?.askGlificConversations;
    const conversations: DifyConversation[] = result?.conversations || [];
    const newItems = toHistoryItems(conversations);

    setChatHistory((prev) => (append ? [...prev, ...newItems] : newItems));
    setHasMoreConversations(result?.hasMore || false);
    if (conversations.length > 0) {
      setLastConversationId(conversations[conversations.length - 1].id);
    }
  };

  const handleSelectConversation = async (selectedConversationId: string) => {
    const selected = chatHistory.find((item) => item.id === selectedConversationId);
    setConversationId(selectedConversationId);
    setConversationName(selected?.title || null);
    setIsLoadingHistory(true);
    setMessages([]);
    setHistoryAnchor(null);

    try {
      const { data } = await fetchMessages({
        variables: { conversationId: selectedConversationId, limit: 50 },
      });
      const result = data?.askGlificMessages;
      const difyMessages = result?.messages || [];

      const loadedMessages: Message[] = difyMessages.flatMap(
        (msg: { id: string; query: string; answer: string; createdAt: number; feedback: string | null }) => {
          const items: Message[] = [];
          if (msg.query) {
            items.push({
              role: 'user',
              content: msg.query,
              timestamp: new Date(msg.createdAt * 1000),
            });
          }
          if (msg.answer) {
            const feedbackValue = msg.feedback === 'like' ? 'up' : msg.feedback === 'dislike' ? 'down' : null;
            items.push({
              role: 'system',
              content: msg.answer,
              timestamp: new Date(msg.createdAt * 1000),
              feedback: feedbackValue,
              messageId: msg.id,
            });
          }
          return items;
        }
      );

      setMessages(loadedMessages);
      setHasMoreMessages(result?.hasMore || false);
      if (difyMessages.length > 0) {
        setFirstMessageId(difyMessages[0].id);
      }
    } catch {
      setMessages([{ role: 'error', content: 'Failed to load conversation history.', timestamp: new Date() }]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!conversationId || !hasMoreMessages || isLoadingHistory) return;
    setIsLoadingHistory(true);

    try {
      const { data } = await fetchMessages({
        variables: { conversationId, limit: 50, firstId: firstMessageId },
      });
      const result = data?.askGlificMessages;
      const difyMessages = result?.messages || [];

      const olderMessages: Message[] = difyMessages.flatMap(
        (msg: { id: string; query: string; answer: string; createdAt: number; feedback: string | null }) => {
          const items: Message[] = [];
          if (msg.query) {
            items.push({
              role: 'user',
              content: msg.query,
              timestamp: new Date(msg.createdAt * 1000),
            });
          }
          if (msg.answer) {
            const feedbackValue = msg.feedback === 'like' ? 'up' : msg.feedback === 'dislike' ? 'down' : null;
            items.push({
              role: 'system',
              content: msg.answer,
              timestamp: new Date(msg.createdAt * 1000),
              feedback: feedbackValue,
              messageId: msg.id,
            });
          }
          return items;
        }
      );

      setMessages((prev) => [...olderMessages, ...prev]);
      setHasMoreMessages(result?.hasMore || false);
      if (difyMessages.length > 0) {
        setFirstMessageId(difyMessages[0].id);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      loadConversations();
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, open]);

  const handleSendMessage = async (msg: Message, currentMessages = messages) => {
    setIsLoading(true);

    try {
      await askGlific({
        variables: {
          input: {
            query: msg.content,
            conversationId: conversationId || '',
            pageUrl: window.location.href,
          },
        },
      });
    } catch {
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
    setConversationName(null);
    setHasMoreMessages(false);
    setFirstMessageId('');
  };

  const handleFeedback = (index: number, type: 'up' | 'down') => {
    const targetMsg = messages[index];
    const newFeedback = targetMsg.feedback === type ? null : type;
    const rating = newFeedback === 'up' ? 'like' : newFeedback === 'down' ? 'dislike' : null;

    setMessages((prev) =>
      prev.map((msg, i) => {
        if (i === index) {
          return { ...msg, feedback: newFeedback };
        }
        return msg;
      })
    );

    if (targetMsg.messageId) {
      submitFeedback({
        variables: {
          input: {
            messageId: targetMsg.messageId,
            rating: rating ?? 'dislike',
          },
        },
      });
    }
  };

  const getChatTitle = (): string => {
    if (conversationName) return conversationName;
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
      {open && (
        <div className={wrapperClass} data-testid="ask-me-bot-panel">
          {/* Chat History Side Panel — sidebar/fullscreen only */}
          {isExpandedMode && showHistory && (
            <div className={styles.HistoryPanel} data-testid="history-panel">
              <div className={styles.HistoryHeader}>
                <span>Chat History</span>
                <Tooltip title="Close history">
                  <IconButton
                    size="small"
                    className={styles.HistoryCloseButton}
                    onClick={() => setShowHistory(false)}
                    data-testid="close-history-btn"
                  >
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </div>
              <div className={styles.HistoryList}>
                {isLoadingConversations && chatHistory.length === 0 && (
                  <div className={styles.LoaderCenter} data-testid="conversations-loading">
                    <CircularProgress size={24} sx={{ color: '#119656' }} />
                  </div>
                )}
                {!isLoadingConversations && chatHistory.length === 0 && (
                  <div className={styles.HistoryEmpty} data-testid="no-conversations">
                    No conversations yet
                  </div>
                )}
                {Object.entries(groupedHistory).map(([date, items]) => (
                  <div key={date}>
                    <div className={styles.HistoryDateLabel}>{date}</div>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`${styles.HistoryItem} ${item.id === conversationId ? styles.HistoryItemActive : ''}`}
                        onClick={() => handleSelectConversation(item.id)}
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
                {hasMoreConversations && (
                  <div
                    className={styles.LoadMoreButton}
                    onClick={() => loadConversations(true)}
                    data-testid="load-more-conversations"
                  >
                    Load more conversations
                  </div>
                )}
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
                className={styles.HistoryDropdown}
              >
                {isLoadingConversations && chatHistory.length === 0 && (
                  <MenuItem disabled className={styles.HistoryDropdownItem}>
                    <div className={styles.LoaderCenter}>
                      <CircularProgress size={20} sx={{ color: '#119656' }} />
                    </div>
                  </MenuItem>
                )}
                {!isLoadingConversations && chatHistory.length === 0 && (
                  <MenuItem disabled className={styles.HistoryDropdownItem}>
                    No conversations yet
                  </MenuItem>
                )}
                {Object.entries(groupedHistory).map(([date, items]) => [
                  <MenuItem key={`label-${date}`} disabled className={styles.HistoryDropdownDate}>
                    {date}
                  </MenuItem>,
                  ...items.map((item) => (
                    <MenuItem
                      key={item.id}
                      onClick={() => handleSelectConversation(item.id)}
                      className={
                        item.id === conversationId ? styles.HistoryDropdownItemActive : styles.HistoryDropdownItem
                      }
                    >
                      {item.title}
                    </MenuItem>
                  )),
                ])}
                {hasMoreConversations && (
                  <MenuItem
                    onClick={() => loadConversations(true)}
                    className={styles.HistoryDropdownItem}
                    data-testid="load-more-conversations-dropdown"
                  >
                    Load more...
                  </MenuItem>
                )}
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
                      setShowHistory(true);
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
                      setShowHistory(true);
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

            {isLoadingHistory && messages.length === 0 ? (
              <div className={styles.LoaderCenter} data-testid="conversation-loading">
                <CircularProgress size={32} sx={{ color: '#119656' }} />
              </div>
            ) : !hasMessages && !isLoading ? (
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
                {hasMoreMessages && (
                  <div className={styles.LoadMoreButton} onClick={loadMoreMessages} data-testid="load-more-messages">
                    {isLoadingHistory ? 'Loading...' : 'Load older messages'}
                  </div>
                )}
                {isLoadingHistory && !hasMoreMessages && messages.length === 0 && (
                  <div className={styles.LoadingContainer}>
                    <span>Loading conversation...</span>
                  </div>
                )}
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
