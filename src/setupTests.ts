// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

global.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: any) {
    return this.store[key] || null;
  }

  setItem(key: any, value: any) {
    this.store[key] = value.toString();
  }

  removeItem(key: any) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

process.env.REACT_APP_WEB_SOCKET = 'ws://localhost/socket';
configure({ adapter: new Adapter() });
