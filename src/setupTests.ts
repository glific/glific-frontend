// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
process.env.REACT_APP_WEB_SOCKET = 'ws://localhost/socket';

// this is to prevent localization warnings that react-i18next generates
beforeEach(() => {
  jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
  }));
});
