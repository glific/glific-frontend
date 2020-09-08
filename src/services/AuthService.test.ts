import { renewAuthToken, checkAuthStatusService, sendOTP, setAuthSession, clearAuthSession, getAuthSession } from "./AuthService";

describe('AuthService', () => {
  // let's create token expiry date for tomorrow
  const tokenExpiryDate = new Date();
  tokenExpiryDate.setDate(new Date().getDate() + 1);
  const session = '{"access_token":"access","renewal_token":"renew", "token_expiry_time":"' + tokenExpiryDate + '"}';

  test('testing renewAuthToken', () => {

  });

  test('testing checkAuthStatusService with empty session', () => {
    const response = checkAuthStatusService();
    expect(response).toBeFalsy();
  });

  test('testing checkAuthStatusService with valid token', () => {
    // set the session
    setAuthSession(session);
    const response = checkAuthStatusService();
    expect(response).toBeTruthy();
  });

  test('testing checkAuthStatusService with expired token and valid refresh token', () => {

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

  test('testing sendOTP', () => {

  });

});
