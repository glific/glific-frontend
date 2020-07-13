import React from 'react';
<<<<<<< HEAD
import { shallow, mount } from 'enzyme';
=======
import { mount } from 'enzyme';
>>>>>>> 766abc7fd7d998dfb1e0de2b4042955d68a3cf99
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

  // test('it should render <Chat /> component correctly if params are passed', () => {
  //   const wrapper = mount(
  //     <MockedProvider mocks={mocks} addTypename={false}>
  //       <MemoryRouter initialEntries={['/chat/1']}>
  //         <App />
  //       </MemoryRouter>
  //     </MockedProvider>
  //   );

  //   expect(wrapper.find(Chat)).toHaveLength(1);
  // });
});
