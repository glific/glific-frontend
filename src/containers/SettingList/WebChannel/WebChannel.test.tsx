import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  updateWebChannelCredentialError,
} from 'mocks/Organization';

const user = userEvent.setup();

// The save tests assert through the success notification, so a call left over from an earlier
// test would let a save whose payload never matched pass.
beforeEach(() => vi.clearAllMocks());

const SAVED = {
  logo_url: 'https://cdn.example.org/logo.png',
  display_name: 'Example Foundation',
  primary_color: '#4C3BCF',
  secondary_color: '#FF8A3D',
  about_description: 'Example Foundation runs learning programmes.',
  about_address: 'Mumbai, Maharashtra',
  about_website: 'theapprenticeproject.org',
  about_email: 'support@tap.org',
  about_hours: 'Mon-Sat, 9am-7pm IST',
};

const SECRET = 'shared-signing-secret-0123456789abcdef';
const NEW_SECRET = 'new-signing-secret-0123456789abcdef';
const signedWith = (secret: string) => ({ jwt_signature_secrets: [{ name: 'Signing secret', secret }] });
const JWT_SECRETS = signedWith(SECRET);
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

const SECTIONS = ['Display picture', 'Display name', 'Brand colours', 'About the organisation', 'JWT signature secret'];

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
    expect(screen.getByDisplayValue('Example Foundation')).toBeInTheDocument();
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

describe('JWT signature secret', () => {
  const fill = (element: HTMLElement, value: string) => fireEvent.change(element, { target: { value } });
  const secretInput = () => screen.getByTestId('signingSecretValue');
  const save = () => user.click(screen.getByTestId('submitActionButton'));

  it('shows the one saved secret, masked, with nothing to add or remove', async () => {
    render(wrapper(savedWith(SAVED, JWT_SECRETS)));

    await waitFor(() => expect(secretInput()).toHaveValue(SECRET));
    expect(secretInput()).toHaveAttribute('type', 'password');
    expect(screen.getAllByTestId('signingSecret')).toHaveLength(1);
    expect(screen.getByText('Signing secret')).toBeInTheDocument();
    expect(screen.getByText(/Your organisation has one secret/)).toBeInTheDocument();
    expect(screen.getByText(/can be replaced but not removed, and replacing it signs out/)).toBeInTheDocument();
    expect(screen.queryByTestId('signingSecretEmpty')).not.toBeInTheDocument();
    expect(screen.queryByText(/rotat/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('addJwtSecret')).not.toBeInTheDocument();
    expect(screen.queryByTestId('removeJwtSecret')).not.toBeInTheDocument();
  });

  it('reveals the secret on request, so an admin can check what they pasted', async () => {
    render(wrapper(savedWith(SAVED, JWT_SECRETS)));

    await waitFor(() => expect(secretInput()).toHaveValue(SECRET));
    await user.click(screen.getByTestId('passwordToggle'));
    expect(secretInput()).toHaveAttribute('type', 'text');

    await user.click(screen.getByTestId('passwordToggle'));
    expect(secretInput()).toHaveAttribute('type', 'password');
  });

  // The server signs and verifies with the first entry only, and refuses to store a second.
  it('shows and saves only the first of the secrets an earlier version saved, dropping the fixed slots', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');
    const legacyKeys = { ...SAVED, jwt_signature_secret_1_name: '2025' };
    const legacySecrets = {
      jwt_signature_secrets: [
        { name: '2025', secret: SECRET },
        { name: '2026', secret: NEW_SECRET },
      ],
      jwt_signature_secret_1: SECRET,
    };

    render(wrapper([...savedWith(legacyKeys, legacySecrets), updateWebChannelCredential(SAVED, JWT_SECRETS)]));

    await waitFor(() => expect(secretInput()).toHaveValue(SECRET));
    expect(screen.getAllByTestId('signingSecret')).toHaveLength(1);

    await save();

    await waitFor(() => expect(notification).toHaveBeenCalledWith('Settings edited successfully!'));
  });

  it('says Glific generates a secret when there is none, and shows the one it generated after saving', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');
    const generated = 'generated-url-safe-secret-0123456789abcd';

    render(
      wrapper([...savedWith(SAVED, {}), updateWebChannelCredential(SAVED, NO_JWT_SECRETS, signedWith(generated))])
    );

    await waitFor(() => expect(screen.getByTestId('signingSecretEmpty')).toBeInTheDocument());
    expect(secretInput()).toHaveValue('');

    await save();

    await waitFor(() => expect(notification).toHaveBeenCalledWith('Settings edited successfully!'));
    await waitFor(() => expect(secretInput()).toHaveValue(generated));
    expect(screen.queryByTestId('signingSecretEmpty')).not.toBeInTheDocument();
  });

  it('asks before replacing the secret, since that signs every web user out', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');

    render(wrapper([...savedWith(SAVED, JWT_SECRETS), updateWebChannelCredential(SAVED, signedWith(NEW_SECRET))]));

    await waitFor(() => expect(secretInput()).toHaveValue(SECRET));
    fill(secretInput(), ` ${NEW_SECRET} `);
    await save();

    await waitFor(() => expect(screen.getByText('Replace the signing secret?')).toBeInTheDocument());
    expect(screen.getByText(/signed out as soon as you save/)).toBeInTheDocument();
    expect(notification).not.toHaveBeenCalled();

    await user.click(screen.getByTestId('ok-button'));

    await waitFor(() => expect(notification).toHaveBeenCalledWith('Settings edited successfully!'));
  });

  it('keeps the secret when the replacement is cancelled', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');

    render(wrapper(savedWith(SAVED, JWT_SECRETS)));

    await waitFor(() => expect(secretInput()).toHaveValue(SECRET));
    fill(secretInput(), NEW_SECRET);
    await save();

    await waitFor(() => expect(screen.getByText('Replace the signing secret?')).toBeInTheDocument());
    await user.click(screen.getByTestId('cancel-button'));

    await waitFor(() => expect(screen.queryByText('Replace the signing secret?')).not.toBeInTheDocument());
    expect(notification).not.toHaveBeenCalled();
  });

  // An empty list on an active channel makes the server generate a new secret, signing everyone out.
  it('refuses to clear a saved secret, and does not save', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');
    render(wrapper(savedWith(SAVED, JWT_SECRETS)));

    await waitFor(() => expect(secretInput()).toHaveValue(SECRET));
    fill(secretInput(), '   ');

    await save();

    await waitFor(() =>
      expect(screen.getByText('The signing secret can be replaced but not removed.')).toBeInTheDocument()
    );
    expect(screen.queryByText('Replace the signing secret?')).not.toBeInTheDocument();
    expect(notification).not.toHaveBeenCalled();
  });

  it('keeps the saved secret when the channel is switched off after clearing it', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');

    render(
      wrapper([...savedWith(SAVED, JWT_SECRETS), updateWebChannelCredential(SAVED, JWT_SECRETS, JWT_SECRETS, false)])
    );

    await waitFor(() => expect(secretInput()).toHaveValue(SECRET));
    fill(secretInput(), '');
    await user.click(screen.getByTestId('checkboxLabel').querySelector('input') as HTMLElement);
    await waitFor(() => expect(screen.queryByTestId('signingSecretValue')).not.toBeInTheDocument());

    await save();

    await waitFor(() => expect(notification).toHaveBeenCalledWith('Settings edited successfully!'));
    expect(screen.queryByText('Replace the signing secret?')).not.toBeInTheDocument();
  });

  it('states the minimum secret length', async () => {
    render(wrapper(on));

    await waitFor(() => expect(screen.getByText(/At least 32 characters/)).toBeInTheDocument());
  });

  it('refuses a secret shorter than 32 characters, and does not save', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');
    render(wrapper(on));

    await waitFor(() => expect(secretInput()).toBeInTheDocument());
    fill(secretInput(), ` ${'a'.repeat(31)} `);

    await save();

    await waitFor(() => expect(screen.getByText('Use at least 32 characters.')).toBeInTheDocument());
    expect(notification).not.toHaveBeenCalled();
  });

  it('saves a pasted secret of exactly 32 characters under the one name the server uses', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');
    const secret = 'b'.repeat(32);

    render(wrapper([...savedWith(SAVED, {}), updateWebChannelCredential(SAVED, signedWith(secret))]));

    await waitFor(() => expect(secretInput()).toBeInTheDocument());
    fill(secretInput(), secret);

    await save();

    await waitFor(() => expect(notification).toHaveBeenCalledWith('Settings edited successfully!'));
    expect(screen.queryByText('Use at least 32 characters.')).not.toBeInTheDocument();
  });

  // The server replaces keys and secrets wholesale, so a save that only sent what changed
  // would wipe the JWT signature secret — and anything set on the credential outside this page.
  it('keeps the secret and every other saved value when only the branding changes', async () => {
    const notification = vi.spyOn(Notification, 'setNotification');
    const keys = { ...SAVED, widget_variant: 'beta' };
    const secrets = { ...JWT_SECRETS, analytics_token: 'kept' };

    render(
      wrapper([
        ...savedWith(keys, secrets),
        updateWebChannelCredential({ ...keys, display_name: 'Example Buddy' }, secrets),
      ])
    );

    await waitFor(() => expect(screen.getByTestId('display_name')).toHaveValue('Example Foundation'));
    fill(screen.getByTestId('display_name'), 'Example Buddy');

    await save();

    await waitFor(() => expect(notification).toHaveBeenCalledWith('Settings edited successfully!'));
    expect(screen.queryByText('Replace the signing secret?')).not.toBeInTheDocument();
  });

  it('shows the error the server gives when it refuses the secret', async () => {
    const errorMessage = vi.spyOn(Notification, 'setErrorMessage');
    const message = 'Only one JWT signature secret is allowed';

    render(wrapper([...savedWith(SAVED, JWT_SECRETS), updateWebChannelCredentialError(SAVED, JWT_SECRETS, message)]));

    await waitFor(() => expect(secretInput()).toHaveValue(SECRET));
    await save();

    await waitFor(() => expect(errorMessage).toHaveBeenCalledWith({ key: 'secrets', message }));
  });
});
