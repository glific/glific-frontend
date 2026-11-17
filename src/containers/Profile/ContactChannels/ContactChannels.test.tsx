import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';

import { ContactChannels } from './ContactChannels';

describe('<ContactChannels />', () => {
  it('lists each channel with its last inbound message', () => {
    const at = '2026-09-25T09:36:00Z';

    render(
      <ContactChannels
        channels={[
          { channel: 'WHATSAPP', lastMessageAt: at },
          { channel: 'WEB', lastMessageAt: null },
        ]}
      />
    );

    const rows = screen.getAllByTestId('channelRow');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('WhatsApp');
    expect(rows[1]).toHaveTextContent('Web');

    const [whatsapp, web] = screen.getAllByTestId('channelLastActivity');
    expect(whatsapp).toHaveTextContent(`${dayjs(at).format('DD/MM/YY, HH:mm')} · inbound message`);
    expect(web).toHaveTextContent('No activity yet');
  });

  it('says so when the contact has no channels', () => {
    render(<ContactChannels channels={[]} />);

    expect(screen.getByTestId('noChannels')).toHaveTextContent('No activity yet');
    expect(screen.queryByTestId('channelRow')).not.toBeInTheDocument();
  });
});
