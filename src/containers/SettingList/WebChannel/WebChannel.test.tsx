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

const OLD_SECRET = 'old-shared-secret-0123456789abcdef';
const NEW_SECRET = 'new-shared-secret-0123456789abcdef';
const JWT_SECRETS = {
  jwt_signature_secrets: [
    { name: '2025', secret: OLD_SECRET },
    { name: '2026', secret: NEW_SECRET },
  ],
};
const NO_JWT_SECRETS = { jwt_signature_secrets: [] };

const wrapper = (mocks: any[]) => (
  <MemoryRouter initialEntries={['/settings/web_channel']}>
    <MockedProvider mocks={[getOrganizationShortcode, ...mocks]} addTypename={false}>
      <WebChannel />
    </MockedProvider>
  </MemoryRouter>
);

const off = [getWebChannelProvider, getWebChannelCredential(), getWebChannelCredential()];
const on = [getWebChannelProvider, getWebChannelCredential(SAVED), getWebChannelCredential(SAVED)];

const SECTIONS = [
  'Display picture',
  'Display name',
  'Brand colours',
  'About the organisation',
  'JWT signature secrets',
];

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

    render(wrapper([...off, createWebChannelCredential(SAVED, NO_JWT_SECRETS)]));

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

describe('JWT signature secrets', () => {
  const fill = (element: HTMLElement, value: string) => fireEvent.change(element, { target: { value } });
  const card = (slot: number) => screen.getByTestId(`jwtSecret${slot}`);
  const nameOf = (slot: number) => within(card(slot)).getByTestId('jwtSecretName');
  const secretOf = (slot: number) => within(card(slot)).getByTestId('jwtSecretValue');
  const save = () => user.click(screen.getByTestId('submitActionButton'));

  it('shows one card per saved secret, each with a name and a masked secret', async () => {
    render(wrapper(savedWith(SAVED, JWT_SECRETS)));

    await waitFor(() => expect(screen.getByTestId('jwtSecret2')).toBeInTheDocument());
    expect(screen.queryByTestId('jwtSecret3')).not.toBeInTheDocument();
    expect(screen.queryByTestId('jwtSecretsEmpty')).not.toBeInTheDocument();
    expect(screen.getByText(/a token signed with any of them is accepted/)).toBeInTheDocument();
    expect(screen.getByText(/To rotate: add the new secret/)).toBeInTheDocument();

    [1, 2].forEach((slot) => {
      // The test i18n mock returns keys uninterpolated, so the heading reads "Secret {{slot}}" here.
      expect(card(slot)).toHaveAccessibleName(/^Secret \{\{slot\}\}/);
      expect(within(card(slot)).getByLabelText('Name')).toBe(nameOf(slot));
      expect(nameOf(slot)).toHaveAttribute('type', 'text');
      expect(nameOf(slot)).toHaveAttribute('placeholder', 'e.g. Tap 2026');
      expect(within(card(slot)).getByLabelText('Secret')).toBe(secretOf(slot));
      expect(secretOf(slot)).toHaveAttribute('type', 'password');
    });

    expect(nameOf(1)).toHaveValue('2025');
    expect(secretOf(1)).toHaveValue(OLD_SECRET);
    expect(nameOf(2)).toHaveValue('2026');
    expect(secretOf(2)).toHaveValue(NEW_SECRET);
  });

  it('shows the empty state for an organisation with no secrets', async () => {
    render(wrapper(on));

    await waitFor(() => expect(screen.getByTestId('jwtSecretsEmpty')).toBeInTheDocument());
    expect(screen.queryByTestId('jwtSecret1')).not.toBeInTheDocument();
    expect(screen.getByTestId('addJwtSecret')).toBeInTheDocument();
  });

  it('allows at most two secrets, and removes the one asked for', async () => {
    render(wrapper(savedWith(SAVED, JWT_SECRETS)));

    await waitFor(() => expect(screen.getByTestId('jwtSecret2')).toBeInTheDocument());
    expect(screen.queryByTestId('addJwtSecret')).not.toBeInTheDocument();

    await user.click(within(card(1)).getByTestId('removeJwtSecret'));

    expect(screen.queryByTestId('jwtSecret2')).not.toBeInTheDocument();
    expect(nameOf(1)).toHaveValue('2026');

    await user.click(screen.getByTestId('addJwtSecret'));

    expect(nameOf(2)).toHaveValue('');
    expect(secretOf(2)).toHaveValue('');
    expect(screen.queryByTestId('addJwtSecret')).not.toBeInTheDocument();
  });

  it('shows only the first two of more saved secrets', async () => {
    const three = {
      jwt_signature_secrets: [
        ...JWT_SECRETS.jwt_signature_secrets,
        { name: '2027', secret: 'third-shared-secret-0123456789abcdef' },
      ],
    };

    render(wrapper(savedWith(SAVED, three)));

    await waitFor(() => expect(screen.getByTestId('jwtSecret2')).toBeInTheDocument());
    expect(screen.queryByTestId('jwtSecret3')).not.toBeInTheDocument();
  });

  it('reveals a secret on request, so an admin can check what they pasted', async () => {
    render(wrapper(savedWith(SAVED, JWT_SECRETS)));

    await waitFor(() => expect(screen.getByTestId('jwtSecret2')).toBeInTheDocument());

    await user.click(within(card(2)).getByTestId('passwordToggle'));
    expect(secretOf(2)).toHaveAttribute('type', 'text');
    expect(secretOf(1)).toHaveAttribute('type', 'password');

    await user.click(within(card(2)).getByTestId('passwordToggle'));
    expect(secretOf(2)).toHaveAttribute('type', 'password');
  });

  it('saves the secrets as one list in the secrets, trimmed', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');

    render(wrapper([...savedWith(SAVED, {}), updateWebChannelCredential(SAVED, JWT_SECRETS)]));

    await waitFor(() => expect(screen.getByTestId('jwtSecretsEmpty')).toBeInTheDocument());
    await user.click(screen.getByTestId('addJwtSecret'));
    await user.click(screen.getByTestId('addJwtSecret'));

    fill(nameOf(1), ' 2025 ');
    fill(secretOf(1), OLD_SECRET);
    fill(nameOf(2), '2026');
    fill(secretOf(2), `${NEW_SECRET} `);

    await save();

    // The mutation's mock matches on the exact payload, so the notification is the assertion.
    await waitFor(() => expect(notification).toHaveBeenCalledWith('Settings edited successfully!'));
  });

  // The server replaces keys and secrets wholesale, so a save that only sent what changed
  // would wipe the JWT signature secrets — and anything set on the credential outside this page.
  it('keeps the JWT signature secrets and every other saved value when only the branding changes', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');
    const keys = { ...SAVED, widget_variant: 'beta' };
    const secrets = { ...JWT_SECRETS, analytics_token: 'kept' };

    render(
      wrapper([
        ...savedWith(keys, secrets),
        updateWebChannelCredential({ ...keys, display_name: 'TAP Buddy' }, secrets),
      ])
    );

    await waitFor(() => expect(screen.getByTestId('display_name')).toHaveValue('The Apprentice Project'));
    fill(screen.getByTestId('display_name'), 'TAP Buddy');

    await save();

    await waitFor(() => expect(notification).toHaveBeenCalledWith('Settings edited successfully!'));
  });

  it('saves an empty list once every secret is removed, keeping other secrets', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');

    render(
      wrapper([
        ...savedWith(SAVED, { ...JWT_SECRETS, analytics_token: 'kept' }),
        updateWebChannelCredential(SAVED, { ...NO_JWT_SECRETS, analytics_token: 'kept' }),
      ])
    );

    await waitFor(() => expect(screen.getByTestId('jwtSecret2')).toBeInTheDocument());
    await user.click(within(card(2)).getByTestId('removeJwtSecret'));
    await user.click(within(card(1)).getByTestId('removeJwtSecret'));
    expect(screen.getByTestId('jwtSecretsEmpty')).toBeInTheDocument();

    await save();

    await waitFor(() => expect(notification).toHaveBeenCalledWith('Settings edited successfully!'));
  });

  it('asks for a name when a secret is filled in', async () => {
    render(wrapper(on));

    await waitFor(() => expect(screen.getByTestId('addJwtSecret')).toBeInTheDocument());
    await user.click(screen.getByTestId('addJwtSecret'));
    fill(secretOf(1), NEW_SECRET);

    await save();

    await waitFor(() =>
      expect(within(card(1)).getByText('Give this secret a name so you can tell it apart.')).toBeInTheDocument()
    );
  });

  it('asks for a secret when only a name is filled in', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');
    render(wrapper(on));

    await waitFor(() => expect(screen.getByTestId('addJwtSecret')).toBeInTheDocument());
    await user.click(screen.getByTestId('addJwtSecret'));
    fill(nameOf(1), '2026');

    await save();

    await waitFor(() => expect(within(card(1)).getByText('Use at least 32 characters.')).toBeInTheDocument());
    expect(notification).not.toHaveBeenCalled();
  });

  it('states the minimum secret length', async () => {
    render(wrapper(on));

    await waitFor(() => expect(screen.getByText(/at least 32 characters/)).toBeInTheDocument());
  });

  it('refuses a secret shorter than 32 characters, under that card only, and does not save', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');
    render(wrapper(savedWith(SAVED, JWT_SECRETS)));

    await waitFor(() => expect(screen.getByTestId('jwtSecret2')).toBeInTheDocument());
    fill(secretOf(2), ` ${'a'.repeat(31)} `);

    await save();

    await waitFor(() => expect(within(card(2)).getByText('Use at least 32 characters.')).toBeInTheDocument());
    expect(within(card(1)).queryByText('Use at least 32 characters.')).not.toBeInTheDocument();
    expect(notification).not.toHaveBeenCalled();
  });

  it('refuses two secrets with the same name, flagging the repeat, and does not save', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');
    render(wrapper(savedWith(SAVED, JWT_SECRETS)));

    await waitFor(() => expect(screen.getByTestId('jwtSecret2')).toBeInTheDocument());
    fill(nameOf(2), ' 2025 ');

    await save();

    await waitFor(() => expect(within(card(2)).getByText('Another secret already has this name.')).toBeInTheDocument());
    expect(within(card(1)).queryByText('Another secret already has this name.')).not.toBeInTheDocument();
    expect(notification).not.toHaveBeenCalled();
  });

  it('saves a secret of exactly 32 characters', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');
    const secret = 'b'.repeat(32);

    render(
      wrapper([
        ...savedWith(SAVED, {}),
        updateWebChannelCredential(SAVED, { jwt_signature_secrets: [{ name: '2025', secret }] }),
      ])
    );

    await waitFor(() => expect(screen.getByTestId('addJwtSecret')).toBeInTheDocument());
    await user.click(screen.getByTestId('addJwtSecret'));
    fill(nameOf(1), '2025');
    fill(secretOf(1), secret);

    await save();

    await waitFor(() => expect(notification).toHaveBeenCalledWith('Settings edited successfully!'));
    expect(screen.queryByText('Use at least 32 characters.')).not.toBeInTheDocument();
  });

  it('saves an empty list when no secret is set', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');

    render(wrapper([...savedWith(SAVED, {}), updateWebChannelCredential(SAVED, NO_JWT_SECRETS)]));

    await waitFor(() => expect(screen.getByTestId('jwtSecretsEmpty')).toBeInTheDocument());

    await save();

    await waitFor(() => expect(notification).toHaveBeenCalledWith('Settings edited successfully!'));
  });
});
