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

// The selected channel is a filled pill in that channel's own colour, matching the
// Contacts / Collections / Searches tabs below it, so the two rows read as one control.
const options = [
  { value: MESSAGE_CHANNELS.whatsapp, label: 'WhatsApp', activeClassName: styles.WhatsAppActive },
  { value: MESSAGE_CHANNELS.web, label: 'Web', activeClassName: styles.WebActive },
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
    className={`${styles.ChannelSelector} ${className ?? ''}`}
    label={label}
    value={value}
    onChange={onChange}
    equalWidth
    options={options.map((option) => ({
      value: option.value,
      label: option.label,
      className: option.value === value ? option.activeClassName : '',
    }))}
  />
);

export default ChannelSelector;
