import { render, screen } from '@testing-library/react';

import { WhatsAppDetails } from './WhatsAppDetails';

describe('<WhatsAppDetails />', () => {
  it('shows the readable status and provider status', () => {
    render(<WhatsAppDetails status="VALID" bspStatus="HSM" />);

    expect(screen.getByTestId('whatsAppStatus')).toHaveTextContent('Valid contact');
    expect(screen.getByTestId('whatsAppProviderStatus')).toHaveTextContent('Can send template messages');
  });

  it('falls back to the raw value, or a dash when there is none', () => {
    render(<WhatsAppDetails status="SOMETHING_NEW" bspStatus={null} />);

    expect(screen.getByTestId('whatsAppStatus')).toHaveTextContent('SOMETHING_NEW');
    expect(screen.getByTestId('whatsAppProviderStatus')).toHaveTextContent('-');
  });
});
