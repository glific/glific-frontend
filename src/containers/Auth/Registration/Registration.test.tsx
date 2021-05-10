import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

import { Registration } from './Registration';

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

    const registration = await findByTestId('AuthContainer');
    expect(registration).toHaveTextContent('Create your new account');
  });

  test('it should submit the form correctly', async () => {
    render(wrapper);
    const inputElements = screen.getAllByRole('textbox');
    await waitFor(() => {
      UserEvent.type(inputElements[0], 'JaneDoe');
      UserEvent.type(inputElements[1], '+919978776554');

      const password = screen.getByLabelText(/password/i);
      UserEvent.type(password, 'pass123456');

      // click on continue
      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);
    });

    // let's mock successful registration submission
    const responseData = { data: { data: { data: {} } } };
    axios.post.mockImplementationOnce(() => Promise.resolve(responseData));
  });

  test('it should submit the form correctly and give error', async () => {
    render(wrapper);

    const inputElements = screen.getAllByRole('textbox');
    UserEvent.type(inputElements[0], 'JaneDoe');
    UserEvent.type(inputElements[1], '+919978776554');

    const password = screen.getByLabelText(/password/i);
    UserEvent.type(password, 'pass123456');

    // click on continue
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    // set the mock error case while registration
    const errorMessage = 'Cannot register 919978776554';
    axios.post.mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
  });
});
