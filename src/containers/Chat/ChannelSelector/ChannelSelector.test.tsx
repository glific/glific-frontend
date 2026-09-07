import { fireEvent, render, screen } from '@testing-library/react';

import { MESSAGE_CHANNELS } from 'common/constants';
import { ChannelSelector } from './ChannelSelector';

const renderSelector = (props: Partial<Parameters<typeof ChannelSelector>[0]> = {}) => {
  const onChange = vi.fn();
  render(<ChannelSelector value={MESSAGE_CHANNELS.whatsapp} onChange={onChange} {...props} />);
  return { onChange };
};

test('offers both channels and marks the selected one', () => {
  renderSelector();

  expect(screen.getByTestId('channelSelector-WHATSAPP')).toHaveAttribute('aria-checked', 'true');
  expect(screen.getByTestId('channelSelector-WEB')).toHaveAttribute('aria-checked', 'false');
});

test('reports the channel that was picked', () => {
  const { onChange } = renderSelector();

  fireEvent.click(screen.getByTestId('channelSelector-WEB'));

  expect(onChange).toHaveBeenCalledWith(MESSAGE_CHANNELS.web);
});

// "WhatsApp" is more than twice as long as "Web", so without equal widths the two options would
// be visibly different sizes.
test('gives both options the same width', () => {
  renderSelector();

  const track = screen.getByTestId('channelSelector');

  expect(track.className).toMatch(/EqualWidthTrack/);
});
