import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  updateWebChannelCredential,
} from 'mocks/Organization';

const user = userEvent.setup();

// The save tests assert through the success notification, so a call left over from an earlier
// test would let a save whose payload never matched pass.
beforeEach(() => vi.clearAllMocks());

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

const LOGIN_KEY_NAMES = { login_key_1_name: '2025', login_key_2_name: '2026' };
const LOGIN_KEY_SECRETS = { login_key_1_secret: 'old-shared-secret', login_key_2_secret: 'new-shared-secret' };
const EMPTY_LOGIN_KEY_NAMES = { login_key_1_name: '', login_key_2_name: '' };
const EMPTY_LOGIN_KEY_SECRETS = { login_key_1_secret: '', login_key_2_secret: '' };

const wrapper = (mocks: any[]) => (
  <MemoryRouter initialEntries={['/settings/web_channel']}>
    <MockedProvider mocks={[getOrganizationShortcode, ...mocks]} addTypename={false}>
      <WebChannel />
    </MockedProvider>
  </MemoryRouter>
);

const off = [getWebChannelProvider, getWebChannelCredential(), getWebChannelCredential()];
const on = [getWebChannelProvider, getWebChannelCredential(SAVED), getWebChannelCredential(SAVED)];

const SECTIONS = ['Display picture', 'Display name', 'Brand colours', 'About the organisation', 'Login keys'];

const savedWith = (keys: any, secrets: any) => [
  getWebChannelProvider,
  getWebChannelCredential(keys, secrets),
  getWebChannelCredential(keys, secrets),
];

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

    render(
      wrapper([...off, createWebChannelCredential({ ...SAVED, ...EMPTY_LOGIN_KEY_NAMES }, EMPTY_LOGIN_KEY_SECRETS)])
    );

    await waitFor(() => expect(screen.getByText('Web channel is active')).toBeInTheDocument());
    await user.click(screen.getByTestId('checkboxLabel').querySelector('input') as HTMLElement);
    await waitFor(() => expect(screen.getByTestId('colorHex-primary_color')).toBeInTheDocument());

    // fireEvent rather than user.type: nine fields typed a keystroke at a time took five
    // seconds locally and blew the 10s limit on CI. What this test is about is the payload,
    // not the typing — the keystroke-level behaviour is covered by the colour tests above.
    const fill = (testId: string, value: string) => fireEvent.change(screen.getByTestId(testId), { target: { value } });

    fill('fileUrlInput', SAVED.logo_url);
    fill('display_name', SAVED.display_name);
    fill('colorHex-primary_color', SAVED.primary_color);
    fill('colorHex-secondary_color', SAVED.secondary_color);
    fill('about_description', SAVED.about_description);
    fill('about_address', SAVED.about_address);
    fill('about_website', SAVED.about_website);
    fill('about_email', SAVED.about_email);
    fill('about_hours', SAVED.about_hours);

    await user.click(screen.getByTestId('submitActionButton'));

    // The mutation's mock matches on the exact keys payload, so reaching the success
    // notification is the assertion that every field was saved under the name the server
    // expects — a renamed or dropped key fails to match and never gets here.
    await waitFor(() => expect(notification).toHaveBeenCalledWith('Settings created successfully!'));
  });
});

describe('login keys', () => {
  const fill = (testId: string, value: string) => fireEvent.change(screen.getByTestId(testId), { target: { value } });

  it('groups each key into its own card, with a name and a masked secret', async () => {
    render(wrapper(on));

    await waitFor(() => expect(screen.getByText('Login keys')).toBeInTheDocument());
    expect(screen.getByText(/Either one works/)).toBeInTheDocument();
    expect(screen.getByText(/To rotate: fill the empty key/)).toBeInTheDocument();

    [1, 2].forEach((slot) => {
      const card = screen.getByTestId(`loginKey${slot}`);

      // The test i18n mock returns keys uninterpolated, so the heading reads "Key {{slot}}" here.
      expect(card).toHaveAccessibleName('Key {{slot}}');

      expect(within(card).getByLabelText('Name')).toBe(screen.getByTestId(`login_key_${slot}_name`));
      expect(within(card).getByLabelText('Name')).toHaveAttribute('type', 'text');
      expect(within(card).getByLabelText('Name')).toHaveAttribute('placeholder', 'e.g. Tap 2026');
      expect(within(card).getByLabelText('Secret')).toBe(screen.getByTestId(`login_key_${slot}_secret`));
      expect(within(card).getByLabelText('Secret')).toHaveAttribute('type', 'password');
    });
  });

  it('reveals a secret on request, so an admin can check what they pasted', async () => {
    render(wrapper(on));

    await waitFor(() => expect(screen.getByTestId('loginKey2')).toBeInTheDocument());
    const card = (slot: number) => screen.getByTestId(`loginKey${slot}`);

    await user.click(within(card(2)).getByTestId('passwordToggle'));
    expect(within(card(2)).getByLabelText('Secret')).toHaveAttribute('type', 'text');
    expect(within(card(1)).getByLabelText('Secret')).toHaveAttribute('type', 'password');

    await user.click(within(card(2)).getByTestId('passwordToggle'));
    expect(within(card(2)).getByLabelText('Secret')).toHaveAttribute('type', 'password');
  });

  it('restores the saved names and secrets', async () => {
    render(wrapper(savedWith({ ...SAVED, ...LOGIN_KEY_NAMES }, LOGIN_KEY_SECRETS)));

    await waitFor(() => expect(screen.getByTestId('login_key_1_name')).toHaveValue('2025'));
    expect(screen.getByTestId('login_key_2_name')).toHaveValue('2026');
    expect(screen.getByTestId('login_key_1_secret')).toHaveValue('old-shared-secret');
    expect(screen.getByTestId('login_key_2_secret')).toHaveValue('new-shared-secret');
  });

  it('saves both names in the keys and both secrets in the secrets', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');

    render(
      wrapper([
        ...savedWith(SAVED, {}),
        updateWebChannelCredential({ ...SAVED, ...LOGIN_KEY_NAMES }, LOGIN_KEY_SECRETS),
      ])
    );

    await waitFor(() => expect(screen.getByTestId('login_key_1_name')).toBeInTheDocument());

    fill('login_key_1_name', ' 2025 ');
    fill('login_key_1_secret', 'old-shared-secret');
    fill('login_key_2_name', '2026');
    fill('login_key_2_secret', 'new-shared-secret ');

    await user.click(screen.getByTestId('submitActionButton'));

    // The mutation's mock matches on the exact payload, so the notification is the assertion.
    await waitFor(() => expect(notification).toHaveBeenCalledWith('Settings edited successfully!'));
  });

  // The server replaces keys and secrets wholesale, so a save that only sent what changed
  // would wipe the login keys — and anything set on the credential outside this page.
  it('keeps the login keys and every other saved value when only the branding changes', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');
    const keys = { ...SAVED, ...LOGIN_KEY_NAMES, widget_variant: 'beta' };
    const secrets = { ...LOGIN_KEY_SECRETS, analytics_token: 'kept' };

    render(
      wrapper([
        ...savedWith(keys, secrets),
        updateWebChannelCredential({ ...keys, display_name: 'TAP Buddy' }, secrets),
      ])
    );

    await waitFor(() => expect(screen.getByTestId('display_name')).toHaveValue('The Apprentice Project'));
    fill('display_name', 'TAP Buddy');

    await user.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => expect(notification).toHaveBeenCalledWith('Settings edited successfully!'));
  });

  it('sends empty slots as empty strings', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');

    render(
      wrapper([
        ...savedWith({ ...SAVED, ...LOGIN_KEY_NAMES }, LOGIN_KEY_SECRETS),
        updateWebChannelCredential(
          { ...SAVED, login_key_1_name: '', login_key_2_name: '2026' },
          { login_key_1_secret: '', login_key_2_secret: 'new-shared-secret' }
        ),
      ])
    );

    await waitFor(() => expect(screen.getByTestId('login_key_1_name')).toHaveValue('2025'));
    fill('login_key_1_name', '');
    fill('login_key_1_secret', '');

    await user.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => expect(notification).toHaveBeenCalledWith('Settings edited successfully!'));
  });

  it('asks for a name when a secret is filled in', async () => {
    render(wrapper(on));

    await waitFor(() => expect(screen.getByTestId('login_key_2_secret')).toBeInTheDocument());
    fill('login_key_2_secret', 'new-shared-secret');

    await user.click(screen.getByTestId('submitActionButton'));

    const card = screen.getByTestId('loginKey2');
    await waitFor(() =>
      expect(within(card).getByText('Give this key a name so you can tell it apart.')).toBeInTheDocument()
    );
    expect(
      within(screen.getByTestId('loginKey1')).queryByText('Give this key a name so you can tell it apart.')
    ).not.toBeInTheDocument();
  });
});
