import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import App from './App';
import Chat from './containers/Chat/Chat';
import { CONVERSATION_MOCKS } from './containers/Chat/Chat.test.helper';

const mocks = CONVERSATION_MOCKS;

describe('<App /> ', () => {
  test('it should render <Chat /> component by default', () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(wrapper.find(Chat)).toHaveLength(1);
  });

  test('it should render <Chat /> component correctly if params are passed', () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/chat/1']}>
          <App />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(wrapper.find(Chat)).toHaveLength(1);
  });
});
