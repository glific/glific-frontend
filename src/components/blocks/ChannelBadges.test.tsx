import { cleanup, render, screen } from '@testing-library/react';
import { BLOCKS, LIST, LOCATION_REQUEST, QUICK_REPLY } from 'common/constants';
import { ChannelBadges } from './ChannelBadges';

afterEach(cleanup);

describe('ChannelBadges (contract §11)', () => {
  test.each([QUICK_REPLY, LIST, LOCATION_REQUEST])('%s is delivered on WhatsApp and Web', (templateType) => {
    render(<ChannelBadges templateType={templateType} />);
    expect(screen.getByTestId('channelBadgeWhatsapp')).toHaveTextContent('WhatsApp');
    expect(screen.getByTestId('channelBadgeWeb')).toHaveTextContent('Web');
  });

  test('blocks is Web only', () => {
    render(<ChannelBadges templateType={BLOCKS} />);
    expect(screen.queryByTestId('channelBadgeWhatsapp')).not.toBeInTheDocument();
    expect(screen.getByTestId('channelBadgeWeb')).toHaveTextContent('Web');
  });
});
