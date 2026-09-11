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

// The selected channel is a filled pill in that channel's own colour, matching the tabs below it.
// Asserting on the class is the only observable signal in jsdom, but it is the thing that carries
// the colour — dropping it would silently return both options to the default white pill.
test('fills the selected option with its own channel colour', () => {
  renderSelector();

  expect(screen.getByTestId('channelSelector-WHATSAPP').className).toMatch(/WhatsAppActive/);
  expect(screen.getByTestId('channelSelector-WEB').className).not.toMatch(/WebActive/);
});

test('moves the fill to the other channel when it is selected', () => {
  renderSelector({ value: MESSAGE_CHANNELS.web });

  expect(screen.getByTestId('channelSelector-WEB').className).toMatch(/WebActive/);
  expect(screen.getByTestId('channelSelector-WHATSAPP').className).not.toMatch(/WhatsAppActive/);
});

// "WhatsApp" is more than twice as long as "Web", so without equal widths the two options would
// be visibly different sizes.
test('gives both options the same width', () => {
  renderSelector();

  const track = screen.getByTestId('channelSelector');

  expect(track.className).toMatch(/EqualWidthTrack/);
});
