import { renewAuthToken, checkAuthStatusService, sendOTP, setAuthSession, clearAuthSession, getAuthSession } from "./AuthService";

describe('AuthService', () => {
  // let's create token expiry date for tomorrow
  const tokenExpiryDate = new Date();
  tokenExpiryDate.setDate(new Date().getDate() + 1);
  const session = '{"access_token":"access","renewal_token":"renew", "token_expiry_time":"' + tokenExpiryDate + '"}';

  test('testing renewAuthToken', () => {

  });

  test('testing checkAuthStatusService', () => {

  });

  test('testing sendOTP', () => {

  });

  test('testing setAuthSession', () => {

  });

  test('testing getAuthSession', () => {

  });

  test('testing clearAuthSession', () => {
    // set the session
    setAuthSession(session);
    // clear the session
    clearAuthSession();
    // expect get session to be empty
    expect(getAuthSession()).toBeFalsy();
  });

});
