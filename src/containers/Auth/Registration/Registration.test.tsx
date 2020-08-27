import React from 'react';
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

import { Registration } from './Registration';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const createRegistration = () => <Registration />;
const createRegistrationMount = () => (
  <MemoryRouter>
    <Registration />
  </MemoryRouter>
);

it('renders component properly', () => {
  const wrapper = shallow(createRegistration());
  expect(wrapper).toBeTruthy();
});
