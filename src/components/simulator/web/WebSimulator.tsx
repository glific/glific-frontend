import { useCallback, useEffect, useState } from 'react';
import { useApolloClient, useMutation, useSubscription } from '@apollo/client';
import dayjs from 'dayjs';

import {
  BLOCKS,
  BLOCKS_RESPONSE,
  DEFAULT_MESSAGE_LIMIT,
  LIST,
  LOCATION_REQUEST,
  QUICK_REPLY,
  SHORT_TIME_FORMAT,
} from 'common/constants';
import { BlocksRenderer, hasBlockPreview } from 'components/blocks/BlocksRenderer';
import { BlocksResponse, deriveBody } from 'containers/InteractiveMessage/Blocks.helper';
import { ChatMessageType } from 'containers/Chat/ChatMessages/ChatMessage/ChatMessageType/ChatMessageType';
import { LocationRequestTemplate } from 'containers/Chat/ChatMessages/ChatMessage/LocationRequestTemplate/LocationRequestTemplate';
import { QuickReplyTemplate } from 'containers/Chat/ChatMessages/QuickReplyTemplate/QuickReplyTemplate';
import {
  ListReplyTemplate,
  ListReplyTemplateDrawer,
  SimulatorTemplate,
} from 'containers/Chat/ChatMessages/ListReplyTemplate/ListReplyTemplate';
import { SIMULATOR_WEB_MESSAGE } from 'graphql/mutations/Simulator';
import { SIMULATOR_SEARCH_QUERY } from 'graphql/queries/Simulator';
import {
  SIMULATOR_MESSAGE_RECEIVED_SUBSCRIPTION,
  SIMULATOR_MESSAGE_SENT_SUBSCRIPTION,
} from 'graphql/subscriptions/Simulator';
import { updateSimulatorConversations } from 'services/SubscriptionService';
import { getUserSession } from 'services/AuthService';
import { setNotification } from 'common/notification';
import setLogs from 'config/logs';
import { SimulatorComposer, SimulatorLocation, SimulatorMedia } from '../composer/SimulatorComposer';
import styles from './WebSimulator.module.css';

/**
 * The Web tab of the flow preview simulator (contract §13).
 *
 * Browser chrome rather than phone chrome, because this previews the embedded web widget. Inbound
 * is produced by the staff-authenticated `simulatorWebMessage` mutation (§13.2), which funnels into
 * the same `Communications.WebMessage.receive_message/2` the real socket uses — so the flow context
 * is created with `channel: "web"` and a blocks node actually fires (§13.1).
 *
 * Only web-channel messages are shown. `channel` is fixed at context creation and never updated,
 * so mixing the two transcripts would be actively misleading (§13.4).
 */
export interface WebSimulatorProps {
  /** The simulator contact the panel allocated. Both tabs share one (§13.4). */
  contact: { id: string; name: string; phone: string };
  /** Keyword posted on mount to start the flow ON THIS CHANNEL. */
  keyword?: string;
  /** Web-channel message types the composer may send (§13.2 freezes the enum). */
  mediaTypes?: string[];
  /** Bumped by the container's reset action; restarts the flow by resending the keyword. */
  resetNonce?: number;
}

const WEB_CHANNEL = 'web';

const getSimulatorVariables = (id: any) => ({
  contactOpts: { limit: 1 },
  filter: { id },
  messageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
});

/** A message belongs to the Web tab only if the backend stamped it `channel: "web"`. */
export const isWebMessage = (message: any): boolean => message?.channel === WEB_CHANNEL;

export const WebSimulator = ({ contact, keyword, mediaTypes, resetNonce = 0 }: WebSimulatorProps) => {
  const client = useApolloClient();
  const [allConversations, setAllConversations] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedListTemplate, setSelectedListTemplate] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const variables = { organizationId: getUserSession('organizationId') };

  const [simulatorWebMessage] = useMutation(SIMULATOR_WEB_MESSAGE);

  useSubscription(SIMULATOR_MESSAGE_SENT_SUBSCRIPTION, {
    variables,
    onData: ({ data }) => setAllConversations((prev: any) => updateSimulatorConversations(prev, data, 'SENT') ?? prev),
    onError: (error) => setLogs(error, 'error', true),
  });

  useSubscription(SIMULATOR_MESSAGE_RECEIVED_SUBSCRIPTION, {
    variables,
    onData: ({ data }) =>
      setAllConversations((prev: any) => updateSimulatorConversations(prev, data, 'RECEIVED') ?? prev),
    onError: (error) => setLogs(error, 'error', true),
  });

  const send = async (input: any) => {
    setSending(true);
    try {
      const { data } = await simulatorWebMessage({ variables: { input: { contactId: contact.id, ...input } } });
      const errors = data?.simulatorWebMessage?.errors;
      if (errors?.length) {
        setNotification(errors[0].message, 'warning');
      }
    } catch (error) {
      setLogs('simulatorWebMessage error', 'error', true);
      setLogs(error, 'error', true);
      setNotification('Could not send the message to the web channel', 'warning');
    } finally {
      setSending(false);
    }
  };

  const sendText = (body: string) => send({ type: 'TEXT', body });

  const sendMedia = (media: SimulatorMedia) =>
    send({ type: media.type, url: media.url, body: media.caption, contentType: media.contentType });

  const sendLocation = (location: SimulatorLocation) =>
    send({ type: 'LOCATION', latitude: location.latitude, longitude: location.longitude });

  /**
   * §13.5 — the Web tab is the only one that exercises the real blocks response path.
   *
   * `values` is the `Json` scalar, whose `parse/1` only accepts an `Absinthe.Blueprint.Input.String`
   * (`generic_types.ex:79`). An object — literal or variable — reaches it as an `Input.Object`, which
   * matches no clause and fails validation field by field. It must go over the wire JSON-encoded.
   */
  const sendBlocksResponse = (messageObject: any, component: string, response: BlocksResponse) =>
    send({
      type: BLOCKS_RESPONSE,
      messageId: messageObject.id,
      component,
      values: JSON.stringify(response.values ?? {}),
      summary: response.summary,
    });

  useEffect(() => {
    client
      .query({
        query: SIMULATOR_SEARCH_QUERY,
        fetchPolicy: 'network-only',
        variables: getSimulatorVariables(contact.id),
      })
      .then(({ data }: any) => {
        setAllConversations(data);
        if (keyword) sendText(keyword);
      })
      .catch((error) => {
        setLogs('WebSimulator SIMULATOR_SEARCH_QUERY error', 'error', true);
        setLogs(error, 'error', true);
      });
  }, [contact.id]);

  // The container's reset has already cleared the transcript; this side restarts the flow on the
  // web channel.
  useEffect(() => {
    if (resetNonce && keyword) sendText(keyword);
  }, [resetNonce]);

  const messages = (allConversations?.search?.[0]?.messages ?? []).filter(isWebMessage);

  const messageRef = useCallback(
    (node: any) => {
      if (node) {
        const nodeCopy = node;
        setTimeout(() => {
          nodeCopy.scrollTop = node.scrollHeight;
        }, 100);
      }
    },
    [messages.length]
  );

  const renderInteractive = (messageObject: any, content: any, messageType: string) => {
    if (messageType === QUICK_REPLY) {
      return (
        <QuickReplyTemplate
          {...content}
          isSimulator
          bspMessageId={messageObject.bspMessageId}
          onQuickReplyClick={(payloadObject: any) => sendText(payloadObject.payload.title)}
        />
      );
    }

    if (messageType === LIST) {
      return (
        <ListReplyTemplate
          {...content}
          bspMessageId={messageObject.bspMessageId}
          component={SimulatorTemplate}
          onGlobalButtonClick={(items: any) => {
            setSelectedListTemplate(items);
            setIsDrawerOpen(true);
          }}
        />
      );
    }

    if (messageType === LOCATION_REQUEST) {
      return (
        <LocationRequestTemplate
          content={content}
          isSimulator
          onSendLocationClick={(payload: any) =>
            sendLocation({ latitude: payload.latitude, longitude: payload.longitude })
          }
        />
      );
    }

    if (messageType === BLOCKS) {
      return hasBlockPreview(content?.component) ? (
        <BlocksRenderer
          content={content}
          compact
          interactive
          onRespond={(response: BlocksResponse) => sendBlocksResponse(messageObject, content.component, response)}
        />
      ) : (
        <div className={styles.NoPreview} data-testid="webBlocksNoPreview">
          {deriveBody(content) || 'This block has no preview'}
        </div>
      );
    }

    return null;
  };

  const renderMessage = (messageObject: any, direction: string, index: number) => {
    const { insertedAt, type, media, location, interactiveContent, body } = messageObject;
    const content = interactiveContent && JSON.parse(interactiveContent);
    const hasInteractive = !!content && !!Object.keys(content).length;
    // an inbound blocks_response carries interactive_content too — it must render as its summary
    const interactive =
      hasInteractive && direction === 'received' ? renderInteractive(messageObject, content, type) : null;

    return (
      <div key={messageObject.id ?? index} className={direction === 'send' ? styles.SentRow : styles.ReceivedRow}>
        <div
          className={`${styles.Bubble} ${direction === 'send' ? styles.Sent : styles.Received}`}
          data-testid="webSimulatorMessage"
        >
          {interactive || (
            <ChatMessageType type={type} media={media} body={body} location={location} isSimulatedMessage />
          )}
          <span className={styles.Time}>{dayjs(insertedAt).format(SHORT_TIME_FORMAT)}</span>
        </div>
      </div>
    );
  };

  const rendered = messages
    .map((messageObject: any, index: number) =>
      // the simulator contact is the RECEIVER of anything the flow sends
      messageObject.receiver.id === contact.id
        ? renderMessage(messageObject, 'received', index)
        : renderMessage(messageObject, 'send', index)
    )
    .reverse();

  return (
    <div className={styles.Browser} data-testid="webSimulator">
      <div className={styles.BrowserBar}>
        <span className={`${styles.Dot} ${styles.Red}`} />
        <span className={`${styles.Dot} ${styles.Amber}`} />
        <span className={`${styles.Dot} ${styles.Green}`} />
        <div className={styles.AddressBar} data-testid="webAddressBar">
          your-site.org
        </div>
      </div>

      <div className={styles.Widget}>
        <div className={styles.WidgetHeader} data-testid="webSimulatorHeader">
          <span className={styles.Avatar}>W</span>
          <span>Chat with us</span>
        </div>

        <div className={styles.Messages} ref={messageRef} data-testid="webSimulatedMessages">
          {rendered}
        </div>

        {isDrawerOpen && (
          <ListReplyTemplateDrawer
            drawerTitle="Items"
            items={selectedListTemplate}
            onItemClick={(payloadObject: any) => {
              sendText(payloadObject.payload.title);
              setIsDrawerOpen(false);
              setSelectedListTemplate(null);
            }}
            onDrawerClose={() => {
              setIsDrawerOpen(false);
              setSelectedListTemplate(null);
            }}
          />
        )}

        <SimulatorComposer
          variant="web"
          disabled={sending}
          mediaTypes={mediaTypes}
          onSendText={sendText}
          onSendMedia={sendMedia}
          onSendLocation={sendLocation}
        />
      </div>
    </div>
  );
};

export default WebSimulator;
