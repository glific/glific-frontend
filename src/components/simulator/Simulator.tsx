import { useState, useEffect, useCallback } from 'react';
import { useApolloClient, useSubscription } from '@apollo/client';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Button, ClickAwayListener } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import MicIcon from '@mui/icons-material/Mic';
import CallIcon from '@mui/icons-material/Call';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VideocamIcon from '@mui/icons-material/Videocam';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import axios from 'axios';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import BackgroundPhoneImage from 'assets/images/phone.png';
import DefaultWhatsappImage from 'assets/images/whatsappDefault.jpg';

import {
  SHORT_TIME_FORMAT,
  SAMPLE_MEDIA_FOR_SIMULATOR,
  LIST,
  QUICK_REPLY,
  DEFAULT_MESSAGE_LIMIT,
  LOCATION_REQUEST,
  BLOCKS,
  MEDIA_MESSAGE_TYPES,
} from 'common/constants';
import { GUPSHUP_CALLBACK_URL } from 'config';
import { ChatMessageType } from 'containers/Chat/ChatMessages/ChatMessage/ChatMessageType/ChatMessageType';
import { TemplateButtons } from 'containers/Chat/ChatMessages/TemplateButtons/TemplateButtons';
import { SIMULATOR_SEARCH_QUERY } from 'graphql/queries/Simulator';
import { getUserSession } from 'services/AuthService';
import { setNotification } from 'common/notification';
import setLogs from 'config/logs';
import { WhatsAppTemplateButton } from 'common/RichEditor';
import { MessageType } from 'containers/Chat/ChatConversations/MessageType/MessageType';
import {
  ListReplyTemplate,
  SimulatorTemplate,
  ListReplyTemplateDrawer,
} from 'containers/Chat/ChatMessages/ListReplyTemplate/ListReplyTemplate';
import { QuickReplyTemplate } from 'containers/Chat/ChatMessages/QuickReplyTemplate/QuickReplyTemplate';
import {
  SIMULATOR_MESSAGE_RECEIVED_SUBSCRIPTION,
  SIMULATOR_MESSAGE_SENT_SUBSCRIPTION,
} from 'graphql/subscriptions/Simulator';
import { updateSimulatorConversations } from 'services/SubscriptionService';
import styles from './Simulator.module.css';
import { LocationRequestTemplate } from 'containers/Chat/ChatMessages/ChatMessage/LocationRequestTemplate/LocationRequestTemplate';
import { BackdropLoader } from 'containers/Flow/FlowTranslation';
import { PollMessage } from 'containers/Chat/ChatMessages/ChatMessage/PollMessage/PollMessage';
import { BlocksCard } from 'containers/Chat/ChatMessages/ChatMessage/BlocksCard/BlocksCard';
import { SimulatorComposer, SimulatorLocation, SimulatorMedia } from './composer/SimulatorComposer';

/**
 * The WhatsApp body of the simulator: phone chrome, transcript, composer and the Gupshup webhook
 * send path. It renders inside `SimulatorContainer` and nothing else — the container owns the
 * drag, the header, the tabs, the reset and close actions, and the simulator-contact allocation.
 *
 * Because allocation lives one level up, this component can neither acquire nor release a contact
 * and does not watch the release subscription. That is what makes "a preview page issues no
 * `GET_SIMULATOR`" a structural property rather than a prop that has to be passed correctly.
 */
export interface SimulatorProps {
  message?: any;
  isPreviewMessage?: boolean;
  getSimulatorId?: any;
  interactiveMessage?: any;
  showHeader?: boolean;
  pollContent?: any;
  /** The contact the container allocated; both tabs share one (§13.4). Absent in preview mode. */
  simulatorContact?: Sender | null;
  /** Restrict the transcript, e.g. to the WhatsApp channel when a Web tab exists (§13.4). */
  messageFilter?: (message: any) => boolean;
  /** Use the shared composer with a real file picker instead of the canned media list (§13.6). */
  realAttachments?: boolean;
  /** Bumped by the container's reset action; restarts the flow by resending the keyword. */
  resetNonce?: number;
}

interface Sender {
  name: string;
  phone: string;
  id: string;
}

const getStyleForDirection = (directionValue: string, isInteractiveValue: boolean, messageTypeValue: any): string => {
  switch (directionValue) {
    case 'received':
      if (isInteractiveValue) {
        const simulatorClasses = [styles.ReceivedMessage, styles.InteractiveReceivedMessage];
        return simulatorClasses.join(' ');
      }

      if (messageTypeValue === 'STICKER') {
        return styles.StickerReceivedMessage;
      }
      break;

    case 'send':
      if (messageTypeValue === 'STICKER') {
        return styles.StickerSendMessage;
      }

      return styles.SendMessage;

    default:
  }

  return styles.ReceivedMessage;
};

const TimeComponent = ({ direction, insertedAt }: any) => (
  <>
    <span className={direction === 'received' ? styles.TimeSent : styles.TimeReceived}>
      {dayjs(insertedAt).format(SHORT_TIME_FORMAT)}
      {direction === 'send' && <DoneAllIcon className={styles.DoneAllIcon} />}
    </span>
  </>
);

const getSimulatorVariables = (id: any) => ({
  contactOpts: {
    limit: 1,
  },
  filter: { id },
  messageOpts: {
    limit: DEFAULT_MESSAGE_LIMIT,
  },
});

const Simulator = ({
  message,
  isPreviewMessage,
  getSimulatorId = () => {},
  interactiveMessage,
  showHeader = true,
  pollContent,
  simulatorContact = null,
  messageFilter,
  realAttachments = false,
  resetNonce = 0,
}: SimulatorProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [simulatedMessages, setSimulatedMessage] = useState<any>();
  const [isOpen, setIsOpen] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);

  const client = useApolloClient();
  // Template listing
  const [isDrawerOpen, setIsDrawerOpen] = useState<Boolean>(false);
  const [selectedListTemplate, setSelectedListTemplate] = useState<any>(null);

  const [allConversations, setAllConversations] = useState<any>({});
  const variables = { organizationId: getUserSession('organizationId') };
  const [currentMessageUuid, setCurrentMessageUuid] = useState<string>('');
  let messages: any[] = [];
  let simulatorId = '';
  const sender: Sender = {
    name: '',
    phone: '',
    id: '',
  };
  // chat messages will be shown on simulator
  const isSimulatedMessage = true;

  useEffect(() => {
    if (isPreviewMessage) return;

    const handleOnline = () => {
      setIsDisconnected(false);
    };

    const handleOffline = () => {
      setIsDisconnected(true);
    };

    if (!navigator.onLine) {
      setIsDisconnected(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (!isPreviewMessage) {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [isPreviewMessage]);

  const sendMessage = (senderDetails: Sender, interactivePayload?: any, templateValue?: any, messageUuid?: any) => {
    const sendMessageText = inputMessage === '' && message ? message : inputMessage;

    // check if send message text is not empty
    if (!sendMessageText && !interactivePayload && !templateValue) return;

    let type = 'text';

    let payload: any = {};

    let context: any = {};

    if (interactivePayload) {
      type = interactivePayload.payload.type;
      payload = interactivePayload.payload;
      payload.id = messageUuid;
      delete payload.type;
      context = interactivePayload.context;
    } else if (templateValue) {
      payload.text = templateValue;
    } else {
      payload.text = sendMessageText;
    }

    axios
      .post(GUPSHUP_CALLBACK_URL, {
        type: 'message',
        payload: {
          id: uuidv4(),
          type,
          payload,
          sender: senderDetails,
          context,
        },
      })
      .catch((error) => {
        // add log's
        setLogs(`sendMessageText:${sendMessageText} GUPSHUP_CALLBACK_URL:${GUPSHUP_CALLBACK_URL}`, 'info');
        setLogs(error, 'error', true);
        setIsDisconnected(true);
      });
    setInputMessage('');
  };

  useSubscription(SIMULATOR_MESSAGE_SENT_SUBSCRIPTION, {
    variables,
    skip: isPreviewMessage,
    onData: ({ data: sentData }) => {
      setAllConversations(updateSimulatorConversations(allConversations, sentData, 'SENT'));
      if (isDisconnected) {
        setIsDisconnected(false);
      }
    },
    onError: (error) => {
      setLogs('SIMULATOR_MESSAGE_SENT_SUBSCRIPTION error', 'error', true);
      setLogs(error, 'error', true);
      setIsDisconnected(true);
    },
  });

  useSubscription(SIMULATOR_MESSAGE_RECEIVED_SUBSCRIPTION, {
    variables,
    skip: isPreviewMessage,
    onData: ({ data: receivedData }) => {
      setAllConversations(updateSimulatorConversations(allConversations, receivedData, 'RECEIVED'));
      // Reset disconnected state on successful data
      if (isDisconnected) {
        setIsDisconnected(false);
      }
    },
    onError: (error) => {
      setLogs('SIMULATOR_MESSAGE_RECEIVED_SUBSCRIPTION error', 'error', true);
      setLogs(error, 'error', true);
      setIsDisconnected(true);
    },
  });

  if (allConversations && allConversations.search && allConversations.search.length > 0) {
    const simulatedContact = allConversations.search;
    messages = simulatedContact[0].messages;
    simulatorId = simulatedContact[0].contact.id;
    sender.name = simulatedContact[0].contact.name;
    sender.phone = simulatedContact[0].contact.phone;
    sender.id = simulatedContact[0].contact.id;
  }

  const handleOpenListReplyDrawer = (items: any, messageUuid: string) => {
    setSelectedListTemplate(items);
    setCurrentMessageUuid(messageUuid);
    setIsDrawerOpen(true);
  };

  const sendMediaMessage = (type: string, payload: any) => {
    axios
      .post(GUPSHUP_CALLBACK_URL, {
        type: 'message',
        payload: {
          id: uuidv4(),
          type,
          payload,
          sender: {
            // this number will be the simulated contact number
            phone: sender.phone || '',
            name: sender.name || '',
          },
        },
      })
      .catch((error) => {
        // add log's
        setLogs(`sendMediaMessage:${type} GUPSHUP_CALLBACK_URL:${GUPSHUP_CALLBACK_URL}`, 'info');
        setLogs(error, 'error', true);
        setIsDisconnected(true);
      });
  };

  const renderMessage = (
    messageObject: any,
    direction: string,
    index: number,
    isInteractive: boolean,
    isPollContent: boolean = false
  ) => {
    const { insertedAt, type, media, location, interactiveContent, bspMessageId, templateType } = messageObject;
    const messageType = isInteractive ? templateType : type;
    const { body, buttons } = WhatsAppTemplateButton(isInteractive ? '' : messageObject.body);

    // Checking if interactive content is present then only parse to JSON
    const content = interactiveContent && JSON.parse(interactiveContent);
    let isInteractiveContentPresent = false;
    let template;

    if (content) {
      isInteractiveContentPresent = !!Object.entries(content).length;

      if (isInteractiveContentPresent && messageType === LIST) {
        template = (
          <>
            <ListReplyTemplate
              {...content}
              bspMessageId={bspMessageId}
              showHeader={showHeader}
              component={SimulatorTemplate}
              onGlobalButtonClick={(items: any) => handleOpenListReplyDrawer(items, messageObject.uuid || '')}
            />
            <TimeComponent direction={direction} insertedAt={insertedAt} />
          </>
        );
      }

      if (isInteractiveContentPresent && messageType === QUICK_REPLY) {
        template = (
          <QuickReplyTemplate
            {...content}
            isSimulator
            showHeader={showHeader}
            disabled={isInteractive}
            bspMessageId={bspMessageId}
            onQuickReplyClick={(value: any) => sendMessage(sender, value, null, messageObject.uuid || '')}
          />
        );
      }
      if (isInteractiveContentPresent && messageType === LOCATION_REQUEST) {
        template = (
          <LocationRequestTemplate
            content={content}
            isSimulator
            onSendLocationClick={(payload: any) => sendMediaMessage('location', payload)}
          />
        );
      }
      if (isInteractiveContentPresent && messageType === BLOCKS) {
        template = (
          <>
            <BlocksCard
              content={content}
              isSimulator
              disabled={isInteractive}
              /**
               * The staff simulator talks to the WhatsApp callback, not the web-channel socket,
               * so a Blocks reply is delivered as its summary text. Per contract §5 that takes
               * the router's default "Responded" exit, which is the same exit a real
               * blocks_response takes.
               */
              onRespond={({ summary }: any) => sendMessage(sender, null, summary)}
            />
            <TimeComponent direction={direction} insertedAt={insertedAt} />
          </>
        );
      }
    }

    let messageBody: any = (
      <>
        <ChatMessageType
          type={messageType}
          media={media}
          body={body}
          location={location}
          isSimulatedMessage={isSimulatedMessage}
        />

        <TimeComponent direction={direction} insertedAt={insertedAt} />
      </>
    );
    if (isInteractiveContentPresent && direction !== 'send') {
      messageBody = template;
    } else if (isPollContent) {
      messageBody = <PollMessage pollContent={pollContent} isSimulator />;
    }

    return (
      <div key={index}>
        <div
          className={getStyleForDirection(direction, isInteractiveContentPresent, messageType)}
          data-testid="simulatorMessage"
        >
          {messageBody}
          {message?.footer && <span className={styles.Footer}>{message.footer}</span>}
        </div>
        <div className={styles.TemplateButtons}>
          <TemplateButtons
            template={buttons}
            callbackTemplateButtonClick={(value: string) => sendMessage(sender, null, value)}
            isSimulator
          />
        </div>
      </div>
    );
  };

  const getChatMessage = () => {
    const chatMessage = (messageFilter ? messages.filter(messageFilter) : messages)
      .map((simulatorMessage: any, index: number) => {
        if (simulatorMessage.receiver.id === simulatorId) {
          return renderMessage(simulatorMessage, 'received', index, false);
        }
        return renderMessage(simulatorMessage, 'send', index, false);
      })
      .reverse();
    setSimulatedMessage(chatMessage);
  };

  const getPreviewMessage = () => {
    if (message && message.type) {
      const previewMessage = renderMessage(message, 'received', 0, false);
      if (['STICKER', 'AUDIO'].includes(message.type)) {
        setSimulatedMessage(previewMessage);
      } else if (message.body || message.media?.caption) {
        setSimulatedMessage(previewMessage);
      } else {
        // To get rid of empty body and media caption for preview HSM
        setSimulatedMessage('');
      }
    }

    if (interactiveMessage) {
      const { templateType, interactiveContent } = interactiveMessage;
      const previewMessage = renderMessage(interactiveMessage, 'received', 0, true);

      setSimulatedMessage(previewMessage);
      if (templateType === LIST) {
        const { items } = JSON.parse(interactiveContent);
        setSelectedListTemplate(items);
      } else {
        setIsDrawerOpen(false);
      }
    }

    if (pollContent) {
      const previewMessage = renderMessage(pollContent, 'received', 0, false, true);
      setSimulatedMessage(previewMessage);
    }
  };

  useEffect(() => {
    if (!isPreviewMessage) {
      handleSimulator();
    }
  }, []);

  // to display only preview for template
  useEffect(() => {
    if (isPreviewMessage) {
      getPreviewMessage();
    }
  }, [message]);

  // The container's reset has already cleared the transcript by the time the nonce changes; this
  // side restarts the flow on the WhatsApp channel. A remount would do the same, but would also
  // flash the full-screen loader that covers an unresolved `simulatorId`.
  useEffect(() => {
    if (!resetNonce) return;
    if (isPreviewMessage) {
      getPreviewMessage();
      return;
    }
    sendMessage(sender);
  }, [resetNonce]);

  // for loading conversation
  useEffect(() => {
    if (allConversations) {
      getChatMessage();
    }
  }, [allConversations]);

  useEffect(() => {
    if (isPreviewMessage && interactiveMessage) {
      getPreviewMessage();
    }

    // Cleaning up simulator when switching between templates
    if (!interactiveMessage) {
      setSimulatedMessage(null);
      setIsDrawerOpen(false);
    }
  }, [interactiveMessage]);

  const messageRef = useCallback(
    (node: any) => {
      if (node) {
        const nodeCopy = node;
        setTimeout(() => {
          nodeCopy.scrollTop = node.scrollHeight;
        }, 100);
      }
    },
    [messages]
  );

  const handleAttachmentClick = (media: any) => {
    const { name: type, payload } = media;

    const mediaUrl = document.querySelector('#media');
    if (mediaUrl) {
      const url = mediaUrl.getAttribute('data-url');
      if (url) {
        payload.url = url;
      }
    }
    sendMediaMessage(type, payload);
    setIsOpen(false);
  };

  const handleListReplyDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedListTemplate(null);
  };

  const handleListDrawerItemClick = (payloadObject: any) => {
    sendMessage(sender, payloadObject, null, currentMessageUuid);
    handleListReplyDrawerClose();
  };

  const dropdown = (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <div className={styles.Dropdown} id="media">
        {SAMPLE_MEDIA_FOR_SIMULATOR.map((media: any) => (
          <Button onClick={() => handleAttachmentClick(media)} key={media.id} className={styles.AttachmentOptions}>
            <MessageType type={media.id} color="dark" />
          </Button>
        ))}
      </div>
    </ClickAwayListener>
  );

  const disconnectionBanner = isDisconnected && !isPreviewMessage && (
    <div className={styles.DisconnectedBanner}>Simulator connection lost. Try to reload.</div>
  );

  const controls = realAttachments ? (
    <div className={styles.Controls}>
      <SimulatorComposer
        disabled={isPreviewMessage || isDisconnected}
        mediaTypes={MEDIA_MESSAGE_TYPES}
        onSendText={(text: string) => sendMessage(sender, null, text)}
        onSendMedia={(media: SimulatorMedia) =>
          sendMediaMessage(media.type.toLowerCase(), { url: media.url, caption: media.caption })
        }
        onSendLocation={(location: SimulatorLocation) =>
          sendMediaMessage('location', {
            latitude: String(location.latitude),
            longitude: String(location.longitude),
          })
        }
      />
    </div>
  ) : (
    <div className={styles.Controls}>
      <div>
        <InsertEmoticonIcon className={styles.Icon} />
        <input
          type="text"
          data-testid="simulatorInput"
          onKeyPress={(event: any) => {
            if (event.key === 'Enter') {
              sendMessage(sender);
            }
          }}
          value={inputMessage}
          placeholder="Type a message"
          disabled={isPreviewMessage || isDisconnected}
          onChange={(event) => setInputMessage(event.target.value)}
        />
        <AttachFileIcon data-testid="attachment" className={styles.AttachFileIcon} onClick={() => setIsOpen(!isOpen)} />
        {isOpen ? dropdown : null}
        <CameraAltIcon className={styles.Icon} />
      </div>

      <Button
        variant="contained"
        className={styles.SendButton}
        disabled={isPreviewMessage || isDisconnected}
        onClick={() => sendMessage(sender)}
      >
        <MicIcon />
      </Button>
    </div>
  );

  const phone = (
    <div>
      <div id="simulator" className={styles.Simulator}>
        <img src={BackgroundPhoneImage} className={styles.BackgroundImage} draggable="false" />

        <div className={styles.Screen}>
          <div className={styles.Header} data-testid="simulatorHeader">
            <ArrowBackIcon />
            <img src={DefaultWhatsappImage} alt="default" />
            <span data-testid="beneficiaryName">Beneficiary</span>
            <div>
              <VideocamIcon />
              <CallIcon />
              <MoreVertIcon />
            </div>
          </div>
          {disconnectionBanner}

          <div className={styles.Messages} ref={messageRef} data-testid="simulatedMessages">
            {simulatedMessages}
          </div>
          {isDrawerOpen && <div className={styles.BackgroundTint} />}
          {controls}
          {isDrawerOpen && (
            <ListReplyTemplateDrawer
              drawerTitle="Items"
              items={selectedListTemplate}
              disableSend={!!interactiveMessage}
              onItemClick={handleListDrawerItemClick}
              onDrawerClose={handleListReplyDrawerClose}
            />
          )}
        </div>
      </div>
    </div>
  );

  const simulator = (
    <div data-testid="simulator-container" className={styles.SimContainer}>
      {phone}
    </div>
  );

  const loadConversation = (contactId: string) =>
    client
      .query({
        fetchPolicy: 'network-only',
        query: SIMULATOR_SEARCH_QUERY,
        variables: getSimulatorVariables(contactId),
      })
      .then(({ data: searchData }: any) => {
        setAllConversations(searchData);
        if (searchData?.search.length > 0) {
          getSimulatorId(searchData.search[0].contact.id);
          sendMessage({
            name: searchData.search[0].contact.name,
            phone: searchData.search[0].contact.phone,
            id: searchData.search[0].contact.id,
          });
        }
      })
      .catch((error) => {
        setLogs('SIMULATOR_SEARCH_QUERY error', 'error', true);
        setLogs(error, 'error', true);
        setIsDisconnected(true);
      });

  const handleSimulator = () => {
    if (simulatorContact) loadConversation(simulatorContact.id);
  };

  return isPreviewMessage ? (
    simulator
  ) : simulatorId ? (
    simulator
  ) : (
    <BackdropLoader text="Please wait while the simulator is loading" />
  );
};

export default Simulator;
