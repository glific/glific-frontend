import axios from 'axios';

import {
  renewAuthToken,
  checkAuthStatusService,
  sendOTP,
  setAuthSession,
  clearAuthSession,
  getAuthSession,
} from './AuthService';

jest.mock('axios');

describe('AuthService', () => {
  // let's create token expiry date for tomorrow
  const tokenExpiryDate = new Date();
  tokenExpiryDate.setDate(new Date().getDate() + 1);
  const session =
    '{"access_token":"access","renewal_token":"renew", "token_expiry_time":"' +
    tokenExpiryDate +
    '"}';

  test('testing renewAuthToken with empty session', async () => {
    const data = {
      data: { renewStatus: false },
    };

    return renewAuthToken().then((response) => {
      console.log('response', response);
      expect(response).toBe(data);
    });

    // jest.fn().mockImplementationOnce(() => Promise.resolve(data));
    // await expect(renewAuthToken()).resolves.toEqual(data);
  });

  test('testing renewAuthToken with valid session', async () => {
    // set the session
    setAuthSession(session);
    const data = {
      data: { renewStatus: true },
    };
    axios.post.mockImplementationOnce(() => Promise.resolve(data));
    await expect(renewAuthToken()).resolves.toEqual(data);
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

  test('testing checkAuthStatusService with expired token and valid refresh token', () => {});

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
    const data = {
      data: { message: 'OTP sent successfully to 919967665667', phone: '919967665667' },
    };
    axios.post.mockImplementationOnce(() => Promise.resolve(data));
    await expect(sendOTP('919967665667')).resolves.toEqual(data);
  });

  test('testing sendOTP failure', async () => {
    const errorMessage = 'Cannot send the otp to 919967665667';
    axios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
    await expect(sendOTP('919967665667')).rejects.toThrow(errorMessage);
  });
});
