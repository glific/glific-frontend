import React from 'react';
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import axios from 'axios';

import { Login } from './Login';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Login test', () => {
  const createLogin = () => <Login />;
  const createLoginMount = () => (
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  it('renders component properly', () => {
    const wrapper = shallow(createLogin());
    expect(wrapper).toBeTruthy();
  });
});
