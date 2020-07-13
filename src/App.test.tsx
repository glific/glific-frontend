import React from 'react';
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Login } from './components/pages/Login/Login';
import App from './App';
import Chat from './containers/Chat/Chat';
import { CONVERSATION_MOCKS } from './containers/Chat/Chat.test.helper';

const mocks = CONVERSATION_MOCKS;

describe('<App /> ', () => {
  test('it should render <App /> component correctly', () => {
    const wrapper = shallow(<App />);
    expect(wrapper.exists()).toBe(true);
  });

  test('it should render <Login /> component by default', () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(wrapper.find(Login)).toHaveLength(1);
  });

  test('it should render <Chat /> component if session is active', () => {
    localStorage.setItem('session', '{"access_token":"access","renewal_token":"renew"}');
    const wrapper = mount(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/chat']}>
          <App />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(wrapper.find(Chat)).toHaveLength(1);
  });
});
