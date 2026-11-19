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
  { value: MESSAGE_CHANNELS.whatsapp, label: 'WhatsApp' },
  { value: MESSAGE_CHANNELS.web, label: 'Web' },
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
      className: option.value === value ? styles.Active : '',
    }))}
  />
);

export default ChannelSelector;
