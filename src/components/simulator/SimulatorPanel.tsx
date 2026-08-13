import { useEffect, useRef, useState } from 'react';
import { useApolloClient, useLazyQuery, useMutation, useSubscription } from '@apollo/client';
import { Tab, Tabs, Tooltip } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import Draggable from 'react-draggable';

import { CHANNEL_WEB, CHANNEL_WHATSAPP, getFlowChannels } from 'common/constants';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { BackdropLoader } from 'containers/Flow/FlowTranslation';
import { CLEAR_MESSAGES } from 'graphql/mutations/Chat';
import { GET_SIMULATOR, RELEASE_SIMULATOR } from 'graphql/queries/Simulator';
import { SIMULATOR_RELEASE_SUBSCRIPTION } from 'graphql/subscriptions/PeriodicInfo';
import { getUserSession } from 'services/AuthService';
import { setNotification } from 'common/notification';
import setLogs from 'config/logs';
import Simulator from './Simulator';
import { WebSimulator, isWebMessage } from './web/WebSimulator';
import styles from './SimulatorPanel.module.css';

/**
 * The dual-channel flow preview panel (contract §13).
 *
 * Owns the drag, the two tabs, and the simulator-contact allocation — one contact for the whole
 * panel, not one per tab, because the pool in `Glific.State.Simulator` is phone-prefix based and
 * has no per-channel notion (§13.4).
 *
 * Exactly ONE tab is mounted at a time, keyed by channel. That is load-bearing rather than
 * cosmetic: each tab starts the flow by sending the keyword on ITS OWN channel, and `channel` is
 * fixed at `init_context` and never updated (§13.4). Two mounted tabs would mean two flow starts,
 * and a web tab riding a WhatsApp-channelled context would silently take the §8 plain-text
 * fallback at every blocks node — appearing to work while proving nothing.
 */
export interface SimulatorPanelProps {
  setShowSimulator: (show: boolean) => void;
  /** The flow's derived `flowType`; tab gating is computed from it via `getFlowChannels`. */
  flowType?: string;
  /** Keyword that starts the flow, sent on whichever channel is active. */
  keyword?: any;
}

/** §13.2 freezes `MessageTypeEnum` for web inbound — STICKER is not in it. */
const WEB_MEDIA_TYPES = ['IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT'];

const DISABLED_REASON: Record<string, string> = {
  [CHANNEL_WHATSAPP]: 'This flow only runs on the web channel, so there is nothing to preview on WhatsApp.',
  [CHANNEL_WEB]: 'This flow only runs on WhatsApp, so there is nothing to preview on the web channel.',
};

/** WhatsApp shows everything that is not web — including the legacy rows with a null channel. */
const isWhatsappMessage = (message: any): boolean => !isWebMessage(message);

export const SimulatorPanel = ({ setShowSimulator, flowType, keyword }: SimulatorPanelProps) => {
  const client = useApolloClient();
  const nodeRef = useRef<HTMLDivElement>(null!);
  const [contact, setContact] = useState<any>(null);
  const [channel, setChannel] = useState<string | null>(null);
  const [pendingChannel, setPendingChannel] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const variables = { organizationId: getUserSession('organizationId') };

  // Derived, never author-chosen (§11). Written generically off the returned array so it keeps
  // working the day `getFlowChannels` learns to say WhatsApp-only.
  const channels = getFlowChannels(flowType || '');
  const enabled = (value: string) => channels.includes(value);

  const [releaseSimulator] = useLazyQuery(RELEASE_SIMULATOR, { fetchPolicy: 'network-only' });
  const [clearMessages] = useMutation(CLEAR_MESSAGES);

  useSubscription(SIMULATOR_RELEASE_SUBSCRIPTION, {
    fetchPolicy: 'network-only',
    variables,
    onData: ({ data: simulatorSubscribe }) => {
      if (!simulatorSubscribe.data) return;
      try {
        const userId = JSON.parse(simulatorSubscribe.data.simulatorRelease).simulator_release.user_id;
        if (userId.toString() === getUserSession('id')) {
          setNotification('Sorry! Simulator timeout. Please click Preview again', 'warning');
          setShowSimulator(false);
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
          setShowSimulator(false);
        }
      })
      .catch((error) => {
        setNotification('Sorry! Failed to get simulator', 'warning');
        setLogs('GET_SIMULATOR error', 'error', true);
        setLogs(error, 'error', true);
        setShowSimulator(false);
      });
  }, []);

  // Start on the first channel the flow actually supports, so a web-only flow never opens onto a
  // disabled tab. `flowType` can be undefined while the flow query refetches — treat that as both.
  useEffect(() => {
    if (channel && enabled(channel)) return;
    setChannel(enabled(CHANNEL_WHATSAPP) ? CHANNEL_WHATSAPP : CHANNEL_WEB);
  }, [flowType]);

  const closePanel = () => {
    releaseSimulator();
    setShowSimulator(false);
  };

  /**
   * §13.4 — a tab switch clears the simulator, because a flow context keeps the channel it was
   * created with. The clear MUST settle before the channel flips: the new tab sends its keyword on
   * mount, and an in-flight clear would delete it and leave the flow unstarted.
   */
  const confirmSwitch = async () => {
    if (!pendingChannel || !contact) return;
    setSwitching(true);
    try {
      await clearMessages({ variables: { contactId: contact.id } });
      setChannel(pendingChannel);
    } catch (error) {
      setLogs('simulator clearMessages error', 'error', true);
      setLogs(error, 'error', true);
      setNotification('Could not reset the simulator. Please try again.', 'warning');
    } finally {
      setSwitching(false);
      setPendingChannel(null);
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
      />
    );

    // MUI Tooltip never fires on a disabled child — it needs a wrapper that still gets events.
    return enabled(value) ? (
      tab
    ) : (
      <Tooltip key={value} title={DISABLED_REASON[value]} placement="top">
        <span className={styles.DisabledTab} data-testid={`simulatorTabDisabled-${value}`}>
          {tab}
        </span>
      </Tooltip>
    );
  };

  const body =
    channel === CHANNEL_WEB ? (
      <WebSimulator key="web" contact={contact} keyword={keyword} mediaTypes={WEB_MEDIA_TYPES} />
    ) : (
      <Simulator
        key="whatsapp"
        embedded
        realAttachments
        hasResetButton
        flowSimulator
        simulatorContact={contact}
        messageFilter={isWhatsappMessage}
        message={keyword}
        setShowSimulator={setShowSimulator}
      />
    );

  return (
    <>
      <Draggable nodeRef={nodeRef} handle=".simulatorPanelHandle">
        <div ref={nodeRef} className={styles.Panel} data-testid="simulatorPanel">
          <div className={`${styles.Header} simulatorPanelHandle`} data-testid="simulatorPanelHeader">
            <Tabs
              value={channel ?? false}
              className={styles.Tabs}
              onChange={(_event, value) => {
                if (value === channel) return;
                setPendingChannel(value);
              }}
            >
              {[tabLabel(CHANNEL_WHATSAPP), tabLabel(CHANNEL_WEB)]}
            </Tabs>
            <ClearIcon className={styles.Close} data-testid="simulatorPanelClose" onClick={closePanel} />
          </div>

          <div className={styles.Body}>
            {contact ? body : <div className={styles.Loading}>Please wait while the simulator is loading</div>}
          </div>
        </div>
      </Draggable>

      {pendingChannel && (
        <DialogBox
          title={`Switch to the ${pendingChannel} preview?`}
          buttonOk="Switch and reset"
          handleOk={confirmSwitch}
          handleCancel={() => setPendingChannel(null)}
          buttonOkLoading={switching}
          disableOk={switching}
          alwaysOntop
        >
          <div data-testid="simulatorSwitchConfirm">
            A flow keeps the channel it was started on, so switching tabs resets the simulator. This clears the
            transcript on both tabs and ends any flow currently in progress.
          </div>
        </DialogBox>
      )}

      {switching && <BackdropLoader text="Resetting the simulator" />}
    </>
  );
};

export default SimulatorPanel;
