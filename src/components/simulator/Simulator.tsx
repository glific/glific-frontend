import { useState, useEffect, useCallback } from 'react';
import { useApolloClient, useLazyQuery, useSubscription } from '@apollo/client';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Button, ClickAwayListener } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Draggable from 'react-draggable';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import MicIcon from '@mui/icons-material/Mic';
import CallIcon from '@mui/icons-material/Call';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VideocamIcon from '@mui/icons-material/Videocam';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import BackgroundPhoneImage from 'assets/images/phone.png';
import DefaultWhatsappImage from 'assets/images/whatsappDefault.jpg';

import ResetIcon from 'assets/images/icons/Reset/Dark.svg?react';
import {
  SHORT_TIME_FORMAT,
  SAMPLE_MEDIA_FOR_SIMULATOR,
  LIST,
  QUICK_REPLY,
  DEFAULT_MESSAGE_LIMIT,
  LOCATION_REQUEST,
} from 'common/constants';
import { GUPSHUP_CALLBACK_URL } from 'config';
import { ChatMessageType } from 'containers/Chat/ChatMessages/ChatMessage/ChatMessageType/ChatMessageType';
import { TemplateButtons } from 'containers/Chat/ChatMessages/TemplateButtons/TemplateButtons';
import {
  GET_SIMULATOR,
  RELEASE_SIMULATOR,
  SIMULATOR_SEARCH_QUERY,
} from 'graphql/queries/Simulator';
// import { SIMULATOR_RELEASE_SUBSCRIPTION } from 'graphql/subscriptions/PeriodicInfo';
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
import { SIMULATOR_RELEASE_SUBSCRIPTION } from 'graphql/subscriptions/PeriodicInfo';

export interface SimulatorProps {
  setShowSimulator?: any;
  simulatorIcon?: boolean;
  message?: any;
  flowSimulator?: boolean;
  isPreviewMessage?: boolean;
  getSimulatorId?: any;
  interactiveMessage?: any;
  showHeader?: boolean;
  hasResetButton?: boolean;
}

interface Sender {
  name: string;
  phone: string;
}

const getStyleForDirection = (
  directionValue: string,
  isInteractiveValue: boolean,
  messageTypeValue: any
): string => {
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

export const Simulator = ({
  setShowSimulator = () => {},
  message,
  isPreviewMessage,
  getSimulatorId = () => {},
  interactiveMessage,
  showHeader = true,
  hasResetButton = false,
}: SimulatorProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [simulatedMessages, setSimulatedMessage] = useState<any>();
  const [isOpen, setIsOpen] = useState(false);

  const client = useApolloClient();
  // Template listing
  const [isDrawerOpen, setIsDrawerOpen] = useState<Boolean>(false);
  const [selectedListTemplate, setSelectedListTemplate] = useState<any>(null);

  const [allConversations, setAllConversations] = useState<any>({});
  const variables = { organizationId: getUserSession('organizationId') };

  let messages: any[] = [];
  let simulatorId = '';
  const sender: Sender = {
    name: '',
    phone: '',
  };
  // chat messages will be shown on simulator
  const isSimulatedMessage = true;

  const sendMessage = (senderDetails: Sender, interactivePayload?: any, templateValue?: any) => {
    const sendMessageText = inputMessage === '' && message ? message : inputMessage;

    // check if send message text is not empty
    if (!sendMessageText && !interactivePayload && !templateValue) return;

    let type = 'text';

    let payload: any = {};

    let context: any = {};

    if (interactivePayload) {
      type = interactivePayload.payload.type;
      payload = interactivePayload.payload;
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
        setLogs(
          `sendMessageText:${sendMessageText} GUPSHUP_CALLBACK_URL:${GUPSHUP_CALLBACK_URL}`,
          'info'
        );
        setLogs(error, 'error');
      });
    setInputMessage('');
  };

  useSubscription(SIMULATOR_RELEASE_SUBSCRIPTION, {
    fetchPolicy: 'network-only',
    variables,
    skip: isPreviewMessage || simulatorId === '',
    onData: ({ data: simulatorSubscribe }) => {
      if (simulatorSubscribe.data) {
        try {
          const userId = JSON.parse(simulatorSubscribe.data.simulatorRelease).simulator_release
            .user_id;
          if (userId.toString() === getUserSession('id')) {
            setShowSimulator(false);
          }
        } catch (error) {
          setLogs('simulator release error', 'error');
        }
      }
    },
  });

  useSubscription(SIMULATOR_MESSAGE_SENT_SUBSCRIPTION, {
    variables,
    skip: isPreviewMessage,
    onData: ({ data: sentData }) => {
      setAllConversations(updateSimulatorConversations(allConversations, sentData, 'SENT'));
    },
  });

  useSubscription(SIMULATOR_MESSAGE_RECEIVED_SUBSCRIPTION, {
    variables,
    skip: isPreviewMessage,
    onData: ({ data: receivedData }) => {
      setAllConversations(updateSimulatorConversations(allConversations, receivedData, 'RECEIVED'));
    },
  });

  const [releaseSimulator]: any = useLazyQuery(RELEASE_SIMULATOR, {
    fetchPolicy: 'network-only',
  });

  if (allConversations && allConversations.search && allConversations.search.length > 0) {
    const simulatedContact = allConversations.search;
    messages = simulatedContact[0].messages;
    simulatorId = simulatedContact[0].contact.id;
    sender.name = simulatedContact[0].contact.name;
    sender.phone = simulatedContact[0].contact.phone;
  }

  const releaseUserSimulator = () => {
    releaseSimulator();
    setShowSimulator(false);
  };

  const handleOpenListReplyDrawer = (items: any) => {
    setSelectedListTemplate(items);
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
        setLogs(error, 'error');
      });
  };

  const renderMessage = (
    messageObject: any,
    direction: string,
    index: number,
    isInteractive: boolean = false
  ) => {
    const { insertedAt, type, media, location, interactiveContent, bspMessageId, templateType } =
      messageObject;

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
              onGlobalButtonClick={handleOpenListReplyDrawer}
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
            onQuickReplyClick={(value: any) => sendMessage(sender, value)}
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
    }

    return (
      <div key={index}>
        <div
          className={getStyleForDirection(direction, isInteractiveContentPresent, messageType)}
          data-testid="simulatorMessage"
        >
          {isInteractiveContentPresent && direction !== 'send' ? (
            template
          ) : (
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
          )}
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
    const chatMessage = messages
      .map((simulatorMessage: any, index: number) => {
        if (simulatorMessage.receiver.id === simulatorId) {
          return renderMessage(simulatorMessage, 'received', index);
        }
        return renderMessage(simulatorMessage, 'send', index);
      })
      .reverse();
    setSimulatedMessage(chatMessage);
  };

  const getPreviewMessage = () => {
    if (message && message.type) {
      const previewMessage = renderMessage(message, 'received', 0);
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
    sendMessage(sender, payloadObject);
    handleListReplyDrawerClose();
  };

  const dropdown = (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <div className={styles.Dropdown} id="media">
        {SAMPLE_MEDIA_FOR_SIMULATOR.map((media: any) => (
          <Button
            onClick={() => handleAttachmentClick(media)}
            key={media.id}
            className={styles.AttachmentOptions}
          >
            <MessageType type={media.id} color="dark" />
          </Button>
        ))}
      </div>
    </ClickAwayListener>
  );

  const simulator = (
    <Draggable>
      <div className={styles.SimContainer}>
        <div>
          <div id="simulator" className={styles.Simulator}>
            <img src={BackgroundPhoneImage} className={styles.BackgroundImage} draggable="false" />
            {!isPreviewMessage && (
              <>
                <ClearIcon
                  className={styles.ClearIcon}
                  onClick={() => {
                    releaseUserSimulator();
                  }}
                  data-testid="clearIcon"
                />
                {hasResetButton && (
                  <ResetIcon
                    data-testid="resetIcon"
                    className={styles.ResetIcon}
                    onClick={() => {
                      sendMessage(sender);
                    }}
                  />
                )}
              </>
            )}

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
              <div className={styles.Messages} ref={messageRef} data-testid="simulatedMessages">
                {simulatedMessages}
              </div>
              {isDrawerOpen && <div className={styles.BackgroundTint} />}
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
                    disabled={isPreviewMessage}
                    onChange={(event) => setInputMessage(event.target.value)}
                  />
                  <AttachFileIcon
                    data-testid="attachment"
                    className={styles.AttachFileIcon}
                    onClick={() => setIsOpen(!isOpen)}
                  />
                  {isOpen ? dropdown : null}
                  <CameraAltIcon className={styles.Icon} />
                </div>

                <Button
                  variant="contained"
                  className={styles.SendButton}
                  disabled={isPreviewMessage}
                  onClick={() => sendMessage(sender)}
                >
                  <MicIcon />
                </Button>
              </div>
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
      </div>
    </Draggable>
  );

  const handleSimulator = () => {
    client
      .query({ query: GET_SIMULATOR, fetchPolicy: 'network-only' })
      .then(({ data: simulatorData }: any) => {
        if (simulatorData.simulatorGet) {
          client
            .query({
              fetchPolicy: 'network-only',
              query: SIMULATOR_SEARCH_QUERY,
              variables: getSimulatorVariables(simulatorData.simulatorGet.id),
            })
            .then(({ data: searchData }: any) => {
              setAllConversations(searchData);
              if (searchData?.search.length > 0) {
                getSimulatorId(searchData.search[0].contact.id);
                sendMessage({
                  name: searchData.search[0].contact.name,
                  phone: searchData.search[0].contact.phone,
                });
              }
            });
        } else {
          setNotification(
            'Sorry! Simulators are in use by other staff members right now. Please wait for it to be idle',
            'warning'
          );
        }
      })
      .catch(() => {
        setNotification('Sorry! Failed to get simulator', 'warning');
      });
  };
  return isPreviewMessage ? (
    simulator
  ) : simulatorId ? (
    simulator
  ) : (
    <BackdropLoader text="Please wait while the simulator is loading" />
  );
};
