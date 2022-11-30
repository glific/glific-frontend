import React, { useState, useEffect, useCallback } from 'react';
import { useLazyQuery, useSubscription } from '@apollo/client';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { Button, ClickAwayListener } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Draggable from 'react-draggable';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import MicIcon from '@material-ui/icons/Mic';
import CallIcon from '@material-ui/icons/Call';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import VideocamIcon from '@material-ui/icons/Videocam';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import ClearIcon from '@material-ui/icons/Clear';
import axios from 'axios';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';

import { Button as FormButton } from 'components/UI/Form/Button/Button';
import DefaultWhatsappImage from 'assets/images/whatsappDefault.jpg';
import { ReactComponent as SimulatorIcon } from 'assets/images/icons/Simulator.svg';
import { ReactComponent as ResetIcon } from 'assets/images/icons/Reset/Dark.svg';
import {
  TIME_FORMAT,
  SAMPLE_MEDIA_FOR_SIMULATOR,
  INTERACTIVE_LIST,
  INTERACTIVE_QUICK_REPLY,
  DEFAULT_MESSAGE_LIMIT,
} from 'common/constants';
import { GUPSHUP_CALLBACK_URL } from 'config';
import { ChatMessageType } from 'containers/Chat/ChatMessages/ChatMessage/ChatMessageType/ChatMessageType';
import { TemplateButtons } from 'containers/Chat/ChatMessages/TemplateButtons/TemplateButtons';
import {
  GET_SIMULATOR,
  RELEASE_SIMULATOR,
  SIMULATOR_SEARCH_QUERY,
} from 'graphql/queries/Simulator';
import { SIMULATOR_RELEASE_SUBSCRIPTION } from 'graphql/subscriptions/PeriodicInfo';
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

export interface SimulatorProps {
  showSimulator: boolean;
  setSimulatorId: any;
  simulatorIcon?: boolean;
  message?: any;
  flowSimulator?: boolean;
  isPreviewMessage?: boolean;
  resetMessage?: Function;
  getFlowKeyword?: Function;
  interactiveMessage?: any;
  showHeader?: boolean;
  hasResetButton?: boolean;
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

const TimeComponent = (direction: any, insertedAt: any) => (
  <>
    <span className={direction === 'received' ? styles.TimeSent : styles.TimeReceived}>
      {moment(insertedAt).format(TIME_FORMAT)}
    </span>
    {direction === 'send' && <DoneAllIcon />}
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
  showSimulator,
  setSimulatorId,
  simulatorIcon = true,
  message,
  flowSimulator,
  isPreviewMessage,
  resetMessage,
  getFlowKeyword,
  interactiveMessage,
  showHeader = true,
  hasResetButton = false,
}: SimulatorProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [simulatedMessages, setSimulatedMessage] = useState<any>();
  const [isOpen, setIsOpen] = useState(false);

  // Template listing
  const [isDrawerOpen, setIsDrawerOpen] = useState<Boolean>(false);
  const [selectedListTemplate, setSelectedListTemplate] = useState<any>(null);

  const variables = { organizationId: getUserSession('organizationId') };

  let messages: any[] = [];
  let simulatorId = '';
  const sender = {
    name: '',
    phone: '',
  };
  // chat messages will be shown on simulator
  const isSimulatedMessage = true;

  const sendMessage = (senderDetails: any, interactivePayload?: any, templateValue?: any) => {
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
    // reset the message from floweditor for the next time
    if (resetMessage) {
      resetMessage();
    }
  };

  const [loadSimulator, { data: allConversations, subscribeToMore }] = useLazyQuery(
    SIMULATOR_SEARCH_QUERY,
    {
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-only',
    }
  );

  const [getSimulator, { data }] = useLazyQuery(GET_SIMULATOR, {
    fetchPolicy: 'network-only',
    onCompleted: (simulatorData) => {
      if (simulatorData.simulatorGet) {
        loadSimulator({ variables: getSimulatorVariables(simulatorData.simulatorGet.id) }).then(
          ({ data: searchData }: any) => {
            if (searchData?.search.length > 0) {
              sendMessage({
                name: searchData.search[0].contact.name,
                phone: searchData.search[0].contact.phone,
              });
            }
          }
        );
        setSimulatorId(simulatorData.simulatorGet.id);
      } else {
        setNotification(
          'Sorry! Simulators are in use by other staff members right now. Please wait for it to be idle',
          'warning'
        );
      }
    },
  });

  const { data: simulatorSubscribe }: any = useSubscription(SIMULATOR_RELEASE_SUBSCRIPTION, {
    variables,
  });

  useEffect(() => {
    if (simulatorSubscribe) {
      try {
        const userId = JSON.parse(simulatorSubscribe.simulatorRelease).simulator_release.user_id;
        if (userId.toString() === getUserSession('id')) {
          setSimulatorId(0);
        }
      } catch (error) {
        setLogs('simulator release error', 'error');
      }
    }
  }, [simulatorSubscribe]);

  useEffect(() => {
    if (subscribeToMore) {
      const subscriptionVariables = { organizationId: getUserSession('organizationId') };
      // message received subscription
      subscribeToMore({
        document: SIMULATOR_MESSAGE_RECEIVED_SUBSCRIPTION,
        variables: subscriptionVariables,
        updateQuery: (prev, { subscriptionData }) =>
          updateSimulatorConversations(prev, subscriptionData, 'RECEIVED'),
      });

      // message sent subscription
      subscribeToMore({
        document: SIMULATOR_MESSAGE_SENT_SUBSCRIPTION,
        variables: subscriptionVariables,
        updateQuery: (prev, { subscriptionData }) =>
          updateSimulatorConversations(prev, subscriptionData, 'SENT'),
      });
    }
  }, [subscribeToMore]);

  const [releaseSimulator]: any = useLazyQuery(RELEASE_SIMULATOR, {
    fetchPolicy: 'network-only',
  });

  if (allConversations && data && data.simulatorGet) {
    // currently setting the simulated contact as the default receiver
    const simulatedContact = allConversations.search.filter(
      (item: any) => item.contact.id === data.simulatorGet.id
    );
    if (simulatedContact.length > 0) {
      messages = simulatedContact[0].messages;
      simulatorId = simulatedContact[0].contact.id;
      sender.name = simulatedContact[0].contact.name;
      sender.phone = simulatedContact[0].contact.phone;
    }
  }

  const releaseUserSimulator = () => {
    releaseSimulator();
    setSimulatorId(0);
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
            phone: data ? data.simulatorGet?.phone : '',
            name: data ? data.simulatorGet?.name : '',
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

      if (isInteractiveContentPresent && messageType === INTERACTIVE_LIST) {
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

      if (isInteractiveContentPresent && messageType === INTERACTIVE_QUICK_REPLY) {
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
    }

    return (
      <div key={index}>
        <div className={getStyleForDirection(direction, isInteractiveContentPresent, messageType)}>
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
      if (templateType === INTERACTIVE_LIST) {
        const { items } = JSON.parse(interactiveContent);
        setSelectedListTemplate(items);
      } else {
        setIsDrawerOpen(false);
      }
    }
  };

  // to display only preview for template
  useEffect(() => {
    if (isPreviewMessage) {
      getPreviewMessage();
    }
  }, [message]);

  // for loading conversation
  useEffect(() => {
    if (allConversations && data) {
      getChatMessage();
    }
  }, [data, allConversations]);

  // for sending message to Gupshup
  useEffect(() => {
    if (!isPreviewMessage && message && data) {
      sendMessage(sender);
    }
  }, [message]);

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
                      if (getFlowKeyword) {
                        getFlowKeyword();
                      }
                    }}
                  />
                )}
              </>
            )}

            <div className={styles.Screen}>
              <div className={styles.Header}>
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
                  color="primary"
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
    // check for the flowkeyword from floweditor
    if (getFlowKeyword) {
      getFlowKeyword();
    }
    getSimulator();
  };
  return (
    <>
      {showSimulator && simulator}
      {simulatorIcon && (
        <SimulatorIcon
          data-testid="simulatorIcon"
          className={showSimulator ? styles.SimulatorIconClicked : styles.SimulatorIconNormal}
          onClick={() => {
            if (showSimulator) {
              releaseUserSimulator();
            } else {
              handleSimulator();
            }
          }}
        />
      )}

      {flowSimulator && (
        <div className={styles.PreviewButton}>
          <FormButton
            variant="outlined"
            color="primary"
            data-testid="previewButton"
            className={styles.Button}
            onClick={() => {
              if (showSimulator) {
                releaseUserSimulator();
              } else {
                handleSimulator();
              }
            }}
          >
            Preview
            {showSimulator && <CancelOutlinedIcon className={styles.CrossIcon} />}
          </FormButton>
        </div>
      )}
    </>
  );
};
