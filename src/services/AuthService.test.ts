import axios from 'axios';

import {
  renewAuthToken,
  checkAuthStatusService,
  sendOTP,
  setAuthSession,
  clearAuthSession,
  getAuthSession,
} from './AuthService';
import setLogs from 'config/logs';

vi.mock('axios');

vi.mock('pino-logflare', () => ({
  createWriteStream: vi.fn(),
  createPinoBrowserSend: vi.fn(),
}));

const mockedAxios = axios as any;

vi.mock('config/logs', () => ({
  default: vi.fn(),
}));

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

  test('testing renewAuthToken', async () => {
    // set the session
    setAuthSession(session);

    // let's mock the axios call
    const responseData = { data: { data: { data: {} } } };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    await expect(renewAuthToken()).resolves.toEqual(responseData);
  });

  test('testing renewAuthToken with error while renewing', async () => {
    // set the session
    setAuthSession(session);

    // let's mock the axios call
    const invalidErrorMessage = 'Invalid token';
    mockedAxios.post.mockImplementationOnce(() => Promise.reject(new Error(invalidErrorMessage)));
    await expect(renewAuthToken()).rejects.toThrow(invalidErrorMessage);
  });

  test('testing checkAuthStatusService with empty session', () => {
    // clear the session
    clearAuthSession();
    const response = checkAuthStatusService();
    expect(response).toBeFalsy();
  });

  test('testing checkAuthStatusService with valid token', () => {
    // set the session
    setAuthSession(session);
    const response = checkAuthStatusService();
    expect(response).toBeTruthy();
  });

  test('testing checkAuthStatusService with expired token', () => {
    // set the session
    const expiredTokenDate = new Date();
    expiredTokenDate.setDate(new Date().getDate() - 1);
    setAuthSession({
      access_token: 'access',
      renewal_token: 'renew',
      token_expiry_time: expiredTokenDate,
    });
    const response = checkAuthStatusService();
    expect(response).toBeFalsy();
  });

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

  test('testing renewAuthToken with error when there is no auth token', async () => {
    clearAuthSession();

    await expect(renewAuthToken()).rejects.toThrow('No renewal token available');
    // Verify setLogs was called with the correct arguments
    expect(setLogs).toHaveBeenCalledWith('Token renewal failed: renewal_token not found', 'error');
  });
});
