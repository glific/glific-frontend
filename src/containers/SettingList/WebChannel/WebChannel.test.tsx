import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';

import * as Notification from 'common/notification';

import { WebChannel } from './WebChannel';
import { createWebChannelCredential, getWebChannelCredential, getWebChannelProvider } from 'mocks/Organization';

const user = userEvent.setup();

const SAVED = {
  logo_url: 'https://cdn.example.org/logo.png',
  display_name: 'The Apprentice Project',
  primary_color: '#4C3BCF',
  secondary_color: '#FF8A3D',
  about_description: 'TAP runs skill-building journeys.',
  about_address: 'Mumbai, Maharashtra',
  about_website: 'theapprenticeproject.org',
  about_email: 'support@tap.org',
  about_hours: 'Mon-Sat, 9am-7pm IST',
};

const wrapper = (mocks: any[]) => (
  <MemoryRouter initialEntries={['/settings/web_channel']}>
    <MockedProvider mocks={mocks} addTypename={false}>
      <WebChannel />
    </MockedProvider>
  </MemoryRouter>
);

const unconfigured = [getWebChannelProvider, getWebChannelCredential(), getWebChannelCredential()];

describe('<WebChannel />', () => {
  it('renders every section of the form', async () => {
    render(wrapper(unconfigured));

    await waitFor(() => {
      expect(screen.getByText('Display picture')).toBeInTheDocument();
    });

    ['Display name', 'Brand colours', 'About the organisation'].forEach((section) =>
      expect(screen.getByText(section)).toBeInTheDocument()
    );
  });

  it('offers the colours the provider declared as defaults, so a new org is never unbranded', async () => {
    render(wrapper(unconfigured));

    await waitFor(() => {
      expect(screen.getByTestId('colorHex-primary_color')).toHaveValue('#4c3bcf');
    });

    expect(screen.getByTestId('colorHex-secondary_color')).toHaveValue('#ff8a3d');
  });

  it('states the contrast guarantee the widget makes, beside the colours it applies to', async () => {
    render(wrapper(unconfigured));

    await waitFor(() => {
      expect(screen.getByText(/auto-flips dark or light/)).toBeInTheDocument();
    });
  });

  it('restores what was saved', async () => {
    render(wrapper([getWebChannelProvider, getWebChannelCredential(SAVED), getWebChannelCredential(SAVED)]));

    await waitFor(() => {
      expect(screen.getByTestId('colorHex-primary_color')).toHaveValue('#4C3BCF');
    });

    expect(screen.getByDisplayValue('The Apprentice Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('support@tap.org')).toBeInTheDocument();
  });

  it('refuses a colour that is not a hex value rather than sending it to a browser', async () => {
    render(wrapper(unconfigured));

    const primary = await screen.findByTestId('colorHex-primary_color');
    await user.clear(primary);
    await user.type(primary, 'cornflower');
    await user.click(await screen.findByTestId('submitActionButton'));

    await waitFor(() => {
      expect(screen.getByText('Enter a colour like #4C3BCF.')).toBeInTheDocument();
    });
  });

  it('expands a three digit colour on blur, so the picker and the server agree', async () => {
    render(wrapper(unconfigured));

    const primary = await screen.findByTestId('colorHex-primary_color');
    await user.clear(primary);
    await user.type(primary, 'abc');
    await user.tab();

    await waitFor(() => {
      expect(primary).toHaveValue('#AABBCC');
    });
  });

  it('saves every field as the credential keys', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');

    render(
      wrapper([
        getWebChannelProvider,
        getWebChannelCredential(),
        getWebChannelCredential(),
        createWebChannelCredential(SAVED),
      ])
    );

    await waitFor(() => {
      expect(screen.getByTestId('colorHex-primary_color')).toBeInTheDocument();
    });

    const fill = async (testId: string, value: string) => {
      const input = screen.getByTestId(testId);
      await user.clear(input);
      await user.type(input, value);
    };

    await user.type(screen.getByTestId('fileUrlInput'), SAVED.logo_url);
    await fill('display_name', SAVED.display_name);
    await fill('colorHex-primary_color', SAVED.primary_color);
    await fill('colorHex-secondary_color', SAVED.secondary_color);
    await fill('about_description', SAVED.about_description);
    await fill('about_address', SAVED.about_address);
    await fill('about_website', SAVED.about_website);
    await fill('about_email', SAVED.about_email);
    await fill('about_hours', SAVED.about_hours);

    await user.click(screen.getByTestId('submitActionButton'));

    // The mutation's mock matches on the exact keys payload, so reaching the success
    // notification is the assertion that every field was saved under the name the server
    // expects — a renamed or dropped key fails to match and never gets here.
    await waitFor(() => {
      expect(notification).toHaveBeenCalled();
    });
  });
});
