import { BLOCKS, LIST, LOCATION_REQUEST, QUICK_REPLY } from 'common/constants';
import { BlocksRenderer, hasBlockPreview } from 'components/blocks/BlocksRenderer';
import { deriveBody } from 'containers/InteractiveMessage/Blocks.helper';
import { ChatMessageType } from 'containers/Chat/ChatMessages/ChatMessage/ChatMessageType/ChatMessageType';
import { LocationRequestTemplate } from 'containers/Chat/ChatMessages/ChatMessage/LocationRequestTemplate/LocationRequestTemplate';
import { PollMessage } from 'containers/Chat/ChatMessages/ChatMessage/PollMessage/PollMessage';
import { QuickReplyTemplate } from 'containers/Chat/ChatMessages/QuickReplyTemplate/QuickReplyTemplate';
import { ListReplyTemplate, SimulatorTemplate } from 'containers/Chat/ChatMessages/ListReplyTemplate/ListReplyTemplate';
import styles from './WebSimulator.module.css';

/**
 * The Web tab's body in PREVIEW mode: web-widget chrome around one sample message.
 *
 * Deliberately a separate component from `WebSimulator` rather than a flag on it. `WebSimulator`
 * needs an allocated simulator contact and opens a query plus two subscriptions on mount; a preview
 * page must issue no network at all, and that invariant is only safe if it is structural.
 */
export interface WebPreviewProps {
  /** A plain sample message, e.g. the HSM body. */
  message?: any;
  /** An interactive template preview: `{ templateType, interactiveContent }`. */
  interactiveMessage?: any;
  /** A poll preview. */
  pollContent?: any;
  /** Whether interactive templates show their header. */
  showHeader?: boolean;
}

const renderInteractive = (templateType: string, content: any, showHeader?: boolean) => {
  if (templateType === QUICK_REPLY) {
    return <QuickReplyTemplate {...content} isSimulator disabled showHeader={showHeader} />;
  }

  if (templateType === LIST) {
    return <ListReplyTemplate {...content} showHeader={showHeader} component={SimulatorTemplate} />;
  }

  if (templateType === LOCATION_REQUEST) {
    return <LocationRequestTemplate content={content} isSimulator />;
  }

  if (templateType === BLOCKS) {
    return hasBlockPreview(content?.component) ? (
      <BlocksRenderer content={content} compact />
    ) : (
      <div className={styles.NoPreview} data-testid="webBlocksNoPreview">
        {deriveBody(content) || 'This block has no preview'}
      </div>
    );
  }

  return null;
};

export const WebPreview = ({ message, interactiveMessage, pollContent, showHeader }: WebPreviewProps) => {
  let body = null;

  if (pollContent) {
    body = <PollMessage pollContent={pollContent} isSimulator />;
  } else if (interactiveMessage?.interactiveContent) {
    const content = JSON.parse(interactiveMessage.interactiveContent);
    body = Object.keys(content).length ? renderInteractive(interactiveMessage.templateType, content, showHeader) : null;
  } else if (message?.type) {
    body = <ChatMessageType type={message.type} media={message.media} body={message.body} isSimulatedMessage />;
  }

  return (
    <div className={styles.Browser} data-testid="webPreview">
      <div className={styles.BrowserBar}>
        <span className={`${styles.Dot} ${styles.Red}`} />
        <span className={`${styles.Dot} ${styles.Amber}`} />
        <span className={`${styles.Dot} ${styles.Green}`} />
        <div className={styles.AddressBar}>your-site.org</div>
      </div>

      <div className={styles.Widget}>
        <div className={styles.WidgetHeader} data-testid="webPreviewHeader">
          <span className={styles.Avatar}>W</span>
          <span>Chat with us</span>
        </div>

        <div className={styles.Messages} data-testid="webPreviewMessages">
          {body && (
            <div className={styles.ReceivedRow}>
              <div className={`${styles.Bubble} ${styles.Received}`} data-testid="webPreviewMessage">
                {body}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebPreview;
