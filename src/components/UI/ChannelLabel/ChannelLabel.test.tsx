import { render, screen } from '@testing-library/react';

import { MESSAGE_CHANNELS } from 'common/constants';
import { ChannelLabel } from './ChannelLabel';

const renderLabel = (props: Partial<Parameters<typeof ChannelLabel>[0]> = {}) => render(<ChannelLabel {...props} />);

test('names the channel the record belongs to', () => {
  renderLabel({ channel: MESSAGE_CHANNELS.web });

  expect(screen.getByTestId('channelLabel')).toHaveTextContent('Web');
});

test.each([
  ['an absent channel', undefined],
  ['a null channel', null],
])('reads %s as WhatsApp', (_case, channel) => {
  renderLabel({ channel });

  expect(screen.getByTestId('channelLabel')).toHaveTextContent('WhatsApp');
});

test('shows an unrecognised channel as itself', () => {
  renderLabel({ channel: 'RCS' as any });

  expect(screen.getByTestId('channelLabel')).toHaveTextContent('RCS');
});

test('colours the dot per channel', () => {
  const { container } = renderLabel({ channel: MESSAGE_CHANNELS.web });

  expect(container.querySelector('span')?.className).toMatch(/Web/);
});

test('takes a custom test id', () => {
  renderLabel({ channel: MESSAGE_CHANNELS.whatsapp, testId: 'flowChannel' });

  expect(screen.getByTestId('flowChannel')).toHaveTextContent('WhatsApp');
});

test('renders a filled chip when asked, tinted per channel', () => {
  renderLabel({ channel: MESSAGE_CHANNELS.web, variant: 'chip' });

  const chip = screen.getByTestId('channelLabel');

  expect(chip.className).toMatch(/Chip/);
  expect(chip.className).toMatch(/WebChip/);
  expect(chip).toHaveTextContent('Web');
});

test('stays a bare label by default, so table cells are unaffected', () => {
  renderLabel({ channel: MESSAGE_CHANNELS.web });

  expect(screen.getByTestId('channelLabel').className).not.toMatch(/Chip/);
});
