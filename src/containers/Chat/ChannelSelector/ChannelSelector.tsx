import { SegmentedControl } from 'components/UI/SegmentedControl/SegmentedControl';
import { MESSAGE_CHANNELS, MessageChannel } from 'common/constants';
import styles from './ChannelSelector.module.css';

export interface ChannelSelectorProps {
  value: MessageChannel;
  onChange: (channel: MessageChannel) => void;
  label?: string;
  testId?: string;
  className?: string;
}

const options = [
  { value: MESSAGE_CHANNELS.whatsapp, label: 'WhatsApp', className: styles.WhatsAppDot },
  { value: MESSAGE_CHANNELS.web, label: 'Web', className: styles.WebDot },
];

export const ChannelSelector = ({
  value,
  onChange,
  label,
  className,
  testId = 'channelSelector',
}: ChannelSelectorProps) => (
  <SegmentedControl<MessageChannel>
    testId={testId}
    className={className}
    label={label}
    value={value}
    onChange={onChange}
    equalWidth
    options={options.map((option) => ({
      value: option.value,
      label: (
        <span className={styles.Option}>
          <span className={`${styles.Dot} ${option.className}`} aria-hidden="true" />
          {option.label}
        </span>
      ),
    }))}
  />
);

export default ChannelSelector;
