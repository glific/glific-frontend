import React from 'react';

import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import App from './App';
import ChatPage from './components/pages/ChatPage/ChatPage';

describe('<App /> ', () => {
  test('it should render <App /> component correctly', () => {
    const wrapper = shallow(<App />);
    expect(wrapper.exists()).toBe(true);
  });

  test('it should render <ChatPage /> component by default', () => {
    const wrapper = mount(
      <MockedProvider>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(wrapper.find(ChatPage)).toHaveLength(1);
  });

  test('it should render <ChatPage /> component correctly if params are passed', () => {
    const wrapper = mount(
      <MockedProvider>
        <MemoryRouter initialEntries={['/chat/1']}>
          <App />
        </MemoryRouter>
      </MockedProvider>
    );

    expect(wrapper.find(ChatPage)).toHaveLength(1);
  });
});
