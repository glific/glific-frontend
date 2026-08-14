import { ReactNode, useEffect, useRef, useState } from 'react';
import { useApolloClient, useLazyQuery, useMutation, useSubscription } from '@apollo/client';
import { CircularProgress, Tab, Tabs, Tooltip } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import Draggable from 'react-draggable';

import ResetIcon from 'assets/images/icons/Reset/Dark.svg?react';
import { CHANNEL_WEB, CHANNEL_WHATSAPP } from 'common/constants';
import { CLEAR_MESSAGES } from 'graphql/mutations/Chat';
import { GET_SIMULATOR, RELEASE_SIMULATOR } from 'graphql/queries/Simulator';
import { SIMULATOR_RELEASE_SUBSCRIPTION } from 'graphql/subscriptions/PeriodicInfo';
import { getUserSession } from 'services/AuthService';
import { setNotification } from 'common/notification';
import setLogs from 'config/logs';
import Simulator from './Simulator';
import { WebSimulator, isWebMessage } from './web/WebSimulator';
import { WebPreview } from './web/WebPreview';
import styles from './SimulatorContainer.module.css';

/**
 * The one draggable simulator shell, used at every call site (contract §13).
 *
 * Owns the drag, the WhatsApp/Web tabs, the reset and close actions, and — in live mode only —
 * the simulator-contact allocation: one contact for the whole container, not one per tab, because
 * the pool in `Glific.State.Simulator` is phone-prefix based and has no per-channel notion (§13.4).
 *
 * Exactly ONE tab is mounted at a time, keyed by channel. That is load-bearing rather than
 * cosmetic: each tab starts the flow by sending the keyword on ITS OWN channel, and `channel` is
 * fixed at `init_context` and never updated (§13.4). Two mounted tabs would mean two flow starts,
 * and a web tab riding a WhatsApp-channelled context would silently take the §8 plain-text
 * fallback at every blocks node — appearing to work while proving nothing.
 *
 * `mode` is the other load-bearing distinction. Allocation is gated on it, never on tabs: a
 * preview page merely being open must not consume a pooled global resource nor arm the release
 * subscription that would then fire spurious timeout notifications.
 */
export type SimulatorMode = 'live' | 'preview';

export interface SimulatorContainerProps {
  /** `live` allocates and releases a simulator contact; `preview` issues no simulator network. */
  mode?: SimulatorMode;
  /** The ENABLED channels; anything outside the set renders as a disabled, explained tab. */
  channels?: string[];
  /** Rendered only when given — a page-embedded preview has nothing to close. */
  onClose?: () => void;
  /** Keyword that starts the flow, sent on whichever channel is active (live mode). */
  keyword?: any;
  /** Live mode: use the real file picker instead of the canned sample-media list (§13.6). */
  realAttachments?: boolean;
  /** Live mode: reports the allocated contact id back to the caller. */
  getSimulatorId?: any;
  /** Preview mode: a plain sample message. */
  message?: any;
  /** Preview mode: an interactive template `{ templateType, interactiveContent }`. */
  interactiveMessage?: any;
  /** Preview mode: a poll. */
  pollContent?: any;
  /** Preview mode: whether interactive templates show their header. */
  showHeader?: boolean;
  /** Preview mode: overrides the Web tab body, e.g. with a validating Blocks panel. */
  webPreview?: ReactNode;
  /** Per-channel copy explaining why a tab is disabled. */
  disabledReason?: Record<string, string>;
}

/** §13.2 freezes `MessageTypeEnum` for web inbound — STICKER is not in it. */
const WEB_MEDIA_TYPES = ['IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT'];

const DEFAULT_DISABLED_REASON: Record<string, string> = {
  [CHANNEL_WHATSAPP]: 'This message does not run on WhatsApp, so there is nothing to preview here.',
  [CHANNEL_WEB]: 'This message does not run on the web channel, so there is nothing to preview here.',
};

/** Flow-editor wording for the same gating, where the subject is the flow rather than a message. */
export const FLOW_DISABLED_REASON: Record<string, string> = {
  [CHANNEL_WHATSAPP]: 'This flow only runs on the web channel, so there is nothing to preview on WhatsApp.',
  [CHANNEL_WEB]: 'This flow only runs on WhatsApp, so there is nothing to preview on the web channel.',
};

/** WhatsApp shows everything that is not web — including the legacy rows with a null channel. */
const isWhatsappMessage = (message: any): boolean => !isWebMessage(message);

export const SimulatorContainer = ({
  mode = 'live',
  channels = [CHANNEL_WHATSAPP, CHANNEL_WEB],
  onClose,
  keyword,
  realAttachments = false,
  getSimulatorId,
  message,
  interactiveMessage,
  pollContent,
  showHeader,
  webPreview,
  disabledReason = DEFAULT_DISABLED_REASON,
}: SimulatorContainerProps) => {
  const client = useApolloClient();
  const nodeRef = useRef<HTMLDivElement>(null!);
  const isLive = mode === 'live';
  const [contact, setContact] = useState<any>(null);
  const [channel, setChannel] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const variables = { organizationId: getUserSession('organizationId') };

  const enabled = (value: string) => channels.includes(value);
  // `channels` is usually computed inline by the caller, so a fresh array every render. Key the
  // effects below on its contents instead, or they re-run forever.
  const channelsKey = channels.join('|');

  const [releaseSimulator] = useLazyQuery(RELEASE_SIMULATOR, { fetchPolicy: 'network-only' });
  const [clearMessages] = useMutation(CLEAR_MESSAGES);

  useSubscription(SIMULATOR_RELEASE_SUBSCRIPTION, {
    fetchPolicy: 'network-only',
    variables,
    skip: !isLive,
    onData: ({ data: simulatorSubscribe }) => {
      if (!simulatorSubscribe.data) return;
      try {
        const userId = JSON.parse(simulatorSubscribe.data.simulatorRelease).simulator_release.user_id;
        if (userId.toString() === getUserSession('id')) {
          setNotification('Sorry! Simulator timeout. Please click Preview again', 'warning');
          onClose?.();
        }
      } catch (error) {
        setLogs('simulator release error', 'error', true);
      }
    },
    onError: (error) => {
      setLogs('SIMULATOR_RELEASE_SUBSCRIPTION error', 'error', true);
      setLogs(error, 'error', true);
    },
  });

  useEffect(() => {
    if (!isLive) return;

    client
      .query({ query: GET_SIMULATOR, fetchPolicy: 'network-only' })
      .then(({ data }: any) => {
        if (data?.simulatorGet) {
          setContact(data.simulatorGet);
        } else {
          setNotification(
            'Sorry! Simulators are in use by other staff members right now. Please wait for it to be idle',
            'warning'
          );
          onClose?.();
        }
      })
      .catch((error) => {
        setNotification('Sorry! Failed to get simulator', 'warning');
        setLogs('GET_SIMULATOR error', 'error', true);
        setLogs(error, 'error', true);
        onClose?.();
      });
  }, [isLive]);

  // Start on the first channel actually supported, so a web-only subject never opens onto a
  // disabled tab. This also re-homes an already-open container when the set shrinks under it.
  useEffect(() => {
    if (channel && enabled(channel)) return;
    setChannel(enabled(CHANNEL_WHATSAPP) ? CHANNEL_WHATSAPP : CHANNEL_WEB);
  }, [channelsKey]);

  const closeContainer = () => {
    if (isLive) releaseSimulator();
    onClose?.();
  };

  /**
   * Reset wipes the transcript and lets the active tab start over. The clear MUST settle before
   * the nonce bumps: the tab restarts by sending its keyword, and an in-flight clear would delete
   * that message and leave the flow unstarted.
   */
  const resetContainer = async () => {
    if (!isLive || !contact) {
      setResetNonce((nonce) => nonce + 1);
      return;
    }

    setSwitching(true);
    try {
      await clearMessages({ variables: { contactId: contact.id } });
      setResetNonce((nonce) => nonce + 1);
    } catch (error) {
      setLogs('simulator clearMessages error', 'error', true);
      setLogs(error, 'error', true);
      setNotification('Could not reset the simulator. Please try again.', 'warning');
    } finally {
      setSwitching(false);
    }
  };

  /**
   * §13.4 — in live mode a tab switch clears the simulator, because a flow context keeps the
   * channel it was created with; a flow started on one tab and continued on the other would
   * silently take the §8 plain-text fallback. It happens silently, but the clear MUST settle
   * before the channel flips: the incoming tab starts by sending its keyword on mount, and an
   * in-flight clear would delete that message and leave the flow unstarted. Preview mode has no
   * context and nothing to clear, so it switches straight away.
   */
  const handleTabChange = async (value: string) => {
    if (value === channel || switching) return;
    if (!isLive || !contact) {
      setChannel(value);
      return;
    }

    setSwitching(true);
    try {
      await clearMessages({ variables: { contactId: contact.id } });
      setChannel(value);
    } catch (error) {
      setLogs('simulator clearMessages error', 'error', true);
      setLogs(error, 'error', true);
      setNotification('Could not reset the simulator. Please try again.', 'warning');
    } finally {
      setSwitching(false);
    }
  };

  const tabLabel = (value: string) => {
    const tab = (
      <Tab
        label={value}
        value={value}
        disabled={!enabled(value)}
        data-testid={`simulatorTab-${value}`}
        className={styles.Tab}
        classes={{ selected: styles.TabSelected }}
        disableRipple
      />
    );

    // MUI Tooltip never fires on a disabled child — it needs a wrapper that still gets events.
    return enabled(value) ? (
      tab
    ) : (
      <Tooltip key={value} title={disabledReason[value]} placement="top">
        <span className={styles.DisabledTab} data-testid={`simulatorTabDisabled-${value}`}>
          {tab}
        </span>
      </Tooltip>
    );
  };

  const liveBody =
    channel === CHANNEL_WEB ? (
      <WebSimulator
        key="web"
        contact={contact}
        keyword={keyword}
        mediaTypes={WEB_MEDIA_TYPES}
        resetNonce={resetNonce}
      />
    ) : (
      <Simulator
        key="whatsapp"
        realAttachments={realAttachments}
        simulatorContact={contact}
        messageFilter={isWhatsappMessage}
        message={keyword}
        getSimulatorId={getSimulatorId}
        resetNonce={resetNonce}
      />
    );

  const previewBody =
    channel === CHANNEL_WEB ? (
      (webPreview ?? (
        <WebPreview
          key="web"
          message={message}
          interactiveMessage={interactiveMessage}
          pollContent={pollContent}
          showHeader={showHeader}
        />
      ))
    ) : (
      <Simulator
        key="whatsapp"
        isPreviewMessage
        message={message}
        interactiveMessage={interactiveMessage}
        pollContent={pollContent}
        showHeader={showHeader}
        resetNonce={resetNonce}
      />
    );

  const body = isLive ? liveBody : previewBody;

  return (
    <Draggable nodeRef={nodeRef} handle=".simulatorContainerHandle">
      <div ref={nodeRef} className={styles.Panel} data-testid="simulatorContainer">
        <div className={`${styles.Header} simulatorContainerHandle`} data-testid="simulatorContainerHeader">
          <Tabs value={channel ?? false} className={styles.Tabs} onChange={(_event, value) => handleTabChange(value)}>
            {[tabLabel(CHANNEL_WHATSAPP), tabLabel(CHANNEL_WEB)]}
          </Tabs>
          <div className={styles.Actions}>
            {switching && <CircularProgress size={16} className={styles.Spinner} data-testid="simulatorSwitching" />}
            <ResetIcon className={styles.Reset} data-testid="simulatorReset" onClick={resetContainer} />
            {onClose && <ClearIcon className={styles.Close} data-testid="simulatorClose" onClick={closeContainer} />}
          </div>
        </div>

        <div className={styles.Body}>
          {isLive && !contact ? <div className={styles.Loading}>Please wait while the simulator is loading</div> : body}
        </div>
      </div>
    </Draggable>
  );
};

export default SimulatorContainer;
