import { render, screen } from '@testing-library/react';

import { ContactChannels } from './ContactChannels';

describe('<ContactChannels />', () => {
  it('marks each channel active or not active', () => {
    render(
      <ContactChannels
        channels={[
          { channel: 'WHATSAPP', active: true },
          { channel: 'WEB', active: false },
        ]}
      />
    );

    const rows = screen.getAllByTestId('channelRow');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('WhatsApp');
    expect(rows[1]).toHaveTextContent('Web');

    const [whatsapp, web] = screen.getAllByTestId('channelStatus');
    expect(whatsapp).toHaveTextContent(/^Active$/);
    expect(web).toHaveTextContent(/^Not active$/);
    expect(screen.getByText('Active means the contact has an identity on that channel.')).toBeInTheDocument();
  });
});
