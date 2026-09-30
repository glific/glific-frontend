import { SegmentedControl } from 'components/UI/SegmentedControl/SegmentedControl';
import { MESSAGE_CHANNELS, MessageChannel } from 'common/constants';
import styles from './ChannelField.module.css';

export interface ChannelFieldProps {
  field: { name: string; value: MessageChannel };
  form: { setFieldValue: (name: string, value: any) => void };
  disabled?: boolean;
  helperText?: string;
  testId?: string;
}

const options = [
  { value: MESSAGE_CHANNELS.whatsapp, label: 'WhatsApp', activeClassName: styles.WhatsAppActive },
  { value: MESSAGE_CHANNELS.web, label: 'Web', activeClassName: styles.WebActive },
];

// A flow's channel is fixed once it exists: switching a built flow to another channel can
// invalidate nodes it already relies on, so an existing flow shows the same control with both
// options disabled. Formik-shaped so `FormLayout` can render it like any other field.
export const ChannelField = ({ field, form, disabled, helperText, testId = 'channelField' }: ChannelFieldProps) => {
  const value = field.value ?? MESSAGE_CHANNELS.whatsapp;

  return (
    <SegmentedControl<MessageChannel>
      testId={testId}
      className={styles.ChannelField}
      value={value}
      onChange={(channel) => form.setFieldValue(field.name, channel)}
      helperText={helperText}
      disabled={disabled}
      equalWidth
      options={options.map((option) => ({
        value: option.value,
        label: option.label,
        className: option.value === value ? option.activeClassName : '',
      }))}
    />
  );
};

export default ChannelField;
