import React from 'react';
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { wait } from '@testing-library/react';

import { Login } from './containers/Auth/Login/Login';
import App from './App';
import { Chat } from './containers/Chat/Chat';
import { CONVERSATION_MOCKS } from './mocks/Chat';
import { setUserSession } from './services/AuthService';

const mocks = CONVERSATION_MOCKS;

const app = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <App />
    </MemoryRouter>
  </MockedProvider>
);

describe('<App /> ', () => {
  test('it should render <App /> component correctly', () => {
    const wrapper = shallow(<App />);
    expect(wrapper.exists()).toBe(true);
  });

  test('it should render <Login /> component by default', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </MockedProvider>
    );

    await wait();
    expect(wrapper.find(Login)).toHaveLength(1);
  });

  test('it should render <Chat /> component if session is active', async () => {
    // let's create token expiry date for tomorrow
    const tokenExpiryDate = new Date();
    tokenExpiryDate.setDate(new Date().getDate() + 1);
    localStorage.setItem(
      'glific_session',
      '{"access_token":"access","renewal_token":"renew", "token_expiry_time":"' +
        tokenExpiryDate +
        '"}'
    );

    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Staff'] }));

    const wrapper = mount(app);

    await wait();

    expect(wrapper.find(Chat)).toHaveLength(1);
  });

  test('it should not render <Chat /> component if session is active and User Role "None"', async () => {
    // let's create token expiry date for tomorrow
    const tokenExpiryDate = new Date();
    tokenExpiryDate.setDate(new Date().getDate() + 1);
    localStorage.setItem(
      'glific_session',
      '{"access_token":"access","renewal_token":"renew", "token_expiry_time":"' +
        tokenExpiryDate +
        '"}'
    );
    setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['None'] }));

    const wrapper = mount(app);

    await wait();

    expect(wrapper.find(Chat)).toMatchObject({});
    await wait();
  });
});
