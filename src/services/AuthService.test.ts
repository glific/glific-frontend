import axios from 'axios';

import { sendOTP, setAuthSession, clearAuthSession, getAuthSession } from './AuthService';

vi.mock('axios');

vi.mock('pino-logflare', () => ({
  createWriteStream: vi.fn(),
  createPinoBrowserSend: vi.fn(),
}));

const mockedAxios = axios as any;

describe('AuthService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // let's create token expiry date for tomorrow
  const tokenExpiryDate = new Date();
  tokenExpiryDate.setDate(new Date().getDate() + 1);
  const session = {
    access_token: 'access',
    renewal_token: 'renew',
    token_expiry_time: tokenExpiryDate,
  };

  // NOTE: token renewal + the 30s-buffer validity check moved to services/TokenManager;
  // their coverage now lives in TokenManager.test.ts.

  test('testing setAuthSession & getAuthSession', () => {
    // set the session
    setAuthSession(session);
    // expect get get the session object
    expect(getAuthSession()).toBeTruthy();
  });

  test('testing clearAuthSession', () => {
    // set the session
    setAuthSession(session);
    // clear the session
    clearAuthSession();
    // expect get session to be empty
    expect(getAuthSession()).toBeFalsy();
  });

  test('testing successful sendOTP', async () => {
    const responseData = {
      data: { message: 'OTP sent successfully to 919967665667', phone: '919967665667' },
    };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    await expect(sendOTP('919967665667')).resolves.toEqual(responseData);
  });

  test('testing sendOTP failure', async () => {
    const errorMessage = 'Cannot send the otp to 919967665667';
    mockedAxios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
    await expect(sendOTP('919967665667')).rejects.toThrow(errorMessage);
  });
});
