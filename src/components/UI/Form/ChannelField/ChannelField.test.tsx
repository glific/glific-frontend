import { fireEvent, render, screen } from '@testing-library/react';

import { MESSAGE_CHANNELS } from 'common/constants';
import { ChannelField } from './ChannelField';

const renderField = (props: any = {}) => {
  const setFieldValue = vi.fn();
  render(
    <ChannelField field={{ name: 'channel', value: MESSAGE_CHANNELS.whatsapp }} form={{ setFieldValue }} {...props} />
  );
  return { setFieldValue };
};

test('offers both channels with the current one selected', () => {
  renderField();

  expect(screen.getByTestId('channelField-WHATSAPP')).toHaveAttribute('aria-checked', 'true');
  expect(screen.getByTestId('channelField-WEB')).toHaveAttribute('aria-checked', 'false');
});

test('reports the picked channel to formik under the field name', () => {
  const { setFieldValue } = renderField();

  fireEvent.click(screen.getByTestId('channelField-WEB'));

  expect(setFieldValue).toHaveBeenCalledWith('channel', MESSAGE_CHANNELS.web);
});

// A flow with no channel yet (created before the column existed) must still render a control
// rather than an unselected pair.
test('treats a missing value as WhatsApp', () => {
  renderField({ field: { name: 'channel', value: undefined } });

  expect(screen.getByTestId('channelField-WHATSAPP')).toHaveAttribute('aria-checked', 'true');
});

// Switching a built flow's channel can invalidate nodes it relies on, so an existing flow shows
// the value and offers no way to change it.
test('renders the value with no control when disabled', () => {
  renderField({ disabled: true, field: { name: 'channel', value: MESSAGE_CHANNELS.web } });

  expect(screen.getByTestId('channelField-readOnly')).toHaveTextContent('Web');
  expect(screen.queryByTestId('channelField-WEB')).not.toBeInTheDocument();
});

test('shows helper text in both states', () => {
  renderField({ helperText: 'Cannot be changed later.' });
  expect(screen.getByText('Cannot be changed later.')).toBeInTheDocument();
});
