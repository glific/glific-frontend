import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MemoryRouter, BrowserRouter } from 'react-router-dom';
import axios from 'axios';

import { Registration } from './Registration';
import OnboardSuccess from '../OnboardSuccess/OnboardSuccess';

jest.mock('axios');

const wrapper = (
  <MemoryRouter>
    <Registration />
  </MemoryRouter>
);

describe('<Registration />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('it should render correctly', async () => {
    const { findByTestId } = render(wrapper);

    const registration = await findByTestId('RegistrationContainer');
    expect(registration).toHaveTextContent('Setup your NGO on Glific');
  });

  test('onboard org correctly', async () => {
    render(wrapper);
    const inputElements = screen.getAllByRole('textbox');

    UserEvent.type(inputElements[0], 'JaneDoe');
    UserEvent.type(inputElements[1], '+919978776554');
    UserEvent.type(inputElements[2], 'Test App');
    UserEvent.type(inputElements[3], 'Vt5Ufo9RXpktxLdcX0awjrrYaWK0GowE');
    UserEvent.type(inputElements[4], 'glific@glific.com');
    UserEvent.type(inputElements[5], 'test');

    // click on continue
    const button = screen.getByText('GET STARTED');

    act(() => {
      UserEvent.click(button);
    });

    const responseData = { data: { is_valid: true, messages: [] } };
    axios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    // render success onboard component after success
    const { container, findByTestId } = render(
      <BrowserRouter>
        <OnboardSuccess />
      </BrowserRouter>
    );

    await waitFor(() => findByTestId('setupInitiation'));
    // let's mock successful registration submission
    expect(container).toHaveTextContent(/Thank you/);
  });

  test('it should submit the form correctly and give error', async () => {
    const { container } = render(wrapper);
    const inputElements = screen.getAllByRole('textbox');

    UserEvent.type(inputElements[0], 'JaneDoe');
    UserEvent.type(inputElements[1], '+919978776554');
    UserEvent.type(inputElements[2], 'Test App');
    UserEvent.type(inputElements[3], 'Vt5Ufo9RXpktxLdcX0awjrrYaWK0GowE');
    UserEvent.type(inputElements[4], 'glific@glific.com');
    UserEvent.type(inputElements[5], 'test');

    // click on continue
    const button = screen.getByText('GET STARTED');

    act(() => {
      UserEvent.click(button);
    });

    // set the mock error case while registration
    const errorMessage = { shortcode: 'Shortcode has already been taken.' };
    const responseData = { data: { is_valid: false, messages: errorMessage } };
    axios.post.mockImplementationOnce(() => Promise.reject(responseData));
  });
});
