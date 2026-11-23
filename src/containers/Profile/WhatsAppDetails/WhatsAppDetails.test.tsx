import { render, screen } from '@testing-library/react';

import { WhatsAppDetails } from './WhatsAppDetails';

describe('<WhatsAppDetails />', () => {
  it('shows the status and the BSP status as the provider status', () => {
    render(<WhatsAppDetails status="VALID" bspStatus="HSM" />);

    expect(screen.getByTestId('whatsAppStatus')).toHaveTextContent(/^VALID$/);
    expect(screen.getByTestId('whatsAppProviderStatus')).toHaveTextContent(/^HSM$/);
  });

  it('shows a dash when there is no value', () => {
    render(<WhatsAppDetails status={null} bspStatus={null} />);

    expect(screen.getByTestId('whatsAppStatus')).toHaveTextContent(/^-$/);
    expect(screen.getByTestId('whatsAppProviderStatus')).toHaveTextContent(/^-$/);
  });
});
