import { render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';

import * as Notification from 'common/notification';
import { WebChannel, webChannelUrl } from './WebChannel';
import {
  createWebChannelCredential,
  getOrganizationShortcode,
  getWebChannelCredential,
  getWebChannelProvider,
} from 'mocks/Organization';

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
    <MockedProvider mocks={[getOrganizationShortcode, ...mocks]} addTypename={false}>
      <WebChannel />
    </MockedProvider>
  </MemoryRouter>
);

const off = [getWebChannelProvider, getWebChannelCredential(), getWebChannelCredential()];
const on = [getWebChannelProvider, getWebChannelCredential(SAVED), getWebChannelCredential(SAVED)];

const SECTIONS = ['Display picture', 'Display name', 'Brand colours', 'About the organisation'];

describe('the active toggle', () => {
  it('starts off for an organisation that has never configured the channel', async () => {
    render(wrapper(off));

    await waitFor(() => expect(screen.getByText('Web channel is active')).toBeInTheDocument());
    expect(screen.getByTestId('checkboxLabel').querySelector('input')).not.toBeChecked();
  });

  // Everything below the toggle configures a channel that is off; showing it would invite an
  // admin to fill in a form that changes nothing.
  it('hides every option while the channel is off', async () => {
    render(wrapper(off));

    await waitFor(() => expect(screen.getByText('Web channel is active')).toBeInTheDocument());

    SECTIONS.forEach((section) => expect(screen.queryByText(section)).not.toBeInTheDocument());
    expect(screen.queryByTestId('colorHex-primary_color')).not.toBeInTheDocument();
    expect(screen.queryByTestId('webChannelUrl')).not.toBeInTheDocument();
  });

  it('reveals the options and the address as soon as it is switched on', async () => {
    render(wrapper(off));

    await waitFor(() => expect(screen.getByText('Web channel is active')).toBeInTheDocument());
    await user.click(screen.getByTestId('checkboxLabel').querySelector('input') as HTMLElement);

    await waitFor(() => expect(screen.getByText('Display picture')).toBeInTheDocument());
    SECTIONS.forEach((section) => expect(screen.getByText(section)).toBeInTheDocument());
    expect(screen.getByTestId('webChannelUrl')).toBeInTheDocument();
  });

  it('comes up already on for a channel that was left active', async () => {
    render(wrapper(on));

    await waitFor(() => expect(screen.getByText('Display picture')).toBeInTheDocument());
    expect(screen.getByTestId('checkboxLabel').querySelector('input')).toBeChecked();
  });
});

describe('the web channel address', () => {
  it('names the organisation and keeps the domain the console is served from', () => {
    // One console deployment serves production and staging, and the two are not on the same
    // domain — a hardcoded glific.com would hand staging admins a link to production.
    expect(webChannelUrl('tides', 'tides.glific.com')).toBe('https://web.tides.glific.com');
    expect(webChannelUrl('tides', 'tides.staging.glific.com')).toBe('https://web.tides.staging.glific.com');
    expect(webChannelUrl('tides', 'localhost')).toBe('https://web.tides.glific.com');
  });

  it("shows the address an organisation's contacts reach", async () => {
    render(wrapper(on));

    await waitFor(() => expect(screen.getByTestId('webChannelUrl')).toBeInTheDocument());
    expect(screen.getByTestId('webChannelUrl')).toHaveTextContent('https://web.tides.glific.com');
  });

  it('copies the address, since it is meant to be shared', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');
    const writeText = vi.fn(() => Promise.resolve());
    // defineProperty rather than assignment: navigator.clipboard is getter-only in jsdom.
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    render(wrapper(on));

    await waitFor(() => expect(screen.getByTestId('copyWebChannelUrl')).toBeInTheDocument());
    await user.click(screen.getByTestId('copyWebChannelUrl'));

    expect(writeText).toHaveBeenCalledWith('https://web.tides.glific.com');
    await waitFor(() => expect(notification).toHaveBeenCalled());
  });
});

describe('<WebChannel />', () => {
  it('offers the colours the provider declared as defaults, so a new org is never unbranded', async () => {
    render(wrapper(off));

    await waitFor(() => expect(screen.getByText('Web channel is active')).toBeInTheDocument());
    await user.click(screen.getByTestId('checkboxLabel').querySelector('input') as HTMLElement);

    await waitFor(() => expect(screen.getByTestId('colorHex-primary_color')).toHaveValue('#4c3bcf'));
    expect(screen.getByTestId('colorHex-secondary_color')).toHaveValue('#ff8a3d');
  });

  it('states the contrast guarantee the widget makes, beside the colours it applies to', async () => {
    render(wrapper(on));

    await waitFor(() => expect(screen.getByText(/auto-flips dark or light/)).toBeInTheDocument());
  });

  it('restores what was saved', async () => {
    render(wrapper(on));

    await waitFor(() => expect(screen.getByTestId('colorHex-primary_color')).toHaveValue('#4C3BCF'));
    expect(screen.getByDisplayValue('The Apprentice Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('support@tap.org')).toBeInTheDocument();
  });

  it('refuses a colour that is not a hex value rather than sending it to a browser', async () => {
    render(wrapper(on));

    const primary = await screen.findByTestId('colorHex-primary_color');
    await user.clear(primary);
    await user.type(primary, 'cornflower');
    await user.click(await screen.findByTestId('submitActionButton'));

    await waitFor(() => expect(screen.getByText('Enter a colour like #4C3BCF.')).toBeInTheDocument());
  });

  it('expands a three digit colour on blur, so the picker and the server agree', async () => {
    render(wrapper(on));

    const primary = await screen.findByTestId('colorHex-primary_color');
    await user.clear(primary);
    await user.type(primary, 'abc');
    await user.tab();

    await waitFor(() => expect(primary).toHaveValue('#AABBCC'));
  });

  it('saves every field as the credential keys', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');

    render(wrapper([...off, createWebChannelCredential(SAVED)]));

    await waitFor(() => expect(screen.getByText('Web channel is active')).toBeInTheDocument());
    await user.click(screen.getByTestId('checkboxLabel').querySelector('input') as HTMLElement);
    await waitFor(() => expect(screen.getByTestId('colorHex-primary_color')).toBeInTheDocument());

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
    await waitFor(() => expect(notification).toHaveBeenCalled());
  });
});
