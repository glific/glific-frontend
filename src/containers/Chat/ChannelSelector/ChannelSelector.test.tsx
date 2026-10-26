import { fireEvent, render, screen } from '@testing-library/react';

import { MESSAGE_CHANNELS } from 'common/constants';
import { ChannelSelector } from './ChannelSelector';
import styles from './ChannelSelector.module.css';

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

// Asserting on the class is the only observable signal in jsdom, but it is the thing that carries
// the Glific green fill — dropping it would silently return the selection to the default white pill.
test('fills the selected option with Glific green', () => {
  renderSelector();

  expect(screen.getByTestId('channelSelector-WHATSAPP')).toHaveClass(styles.Active);
  expect(screen.getByTestId('channelSelector-WEB')).not.toHaveClass(styles.Active);
});

test('moves the fill to the other channel when it is selected', () => {
  renderSelector({ value: MESSAGE_CHANNELS.web });

  expect(screen.getByTestId('channelSelector-WEB')).toHaveClass(styles.Active);
  expect(screen.getByTestId('channelSelector-WHATSAPP')).not.toHaveClass(styles.Active);
});

// "WhatsApp" is more than twice as long as "Web", so without equal widths the two options would
// be visibly different sizes.
test('gives both options the same width', () => {
  renderSelector();

  const track = screen.getByTestId('channelSelector');

  expect(track.className).toMatch(/EqualWidthTrack/);
});
