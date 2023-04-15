import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { vi } from 'vitest';

import { Registration } from './Registration';

vi.mock('axios');
const mockedAxios = axios as any;

const wrapper = (
  <MemoryRouter>
    <GoogleReCaptchaProvider reCaptchaKey="test key">
      <Registration />
    </GoogleReCaptchaProvider>
  </MemoryRouter>
);

export const postRequestMock = () => {
  const responseData = { data: { data: {} } };
  const successPromise = vi.fn(() => Promise.resolve(responseData));
  mockedAxios.post.mockImplementation(() => successPromise());
};

describe('<Registration />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    postRequestMock();
  });

  it('should render correctly', async () => {
    render(wrapper);

    await waitFor(() => {
      const registration = screen.getByTestId('AuthContainer');
      expect(registration).toHaveTextContent('Create your new account');
    });
  });

  it('should check if all the fields are in correct state', async () => {
    const user = userEvent.setup();
    const { container } = render(wrapper);

    const userName = container.querySelector('input[name="userName"]') as HTMLInputElement;
    await user.click(userName);
    await user.keyboard('John doe');

    const phone = container.querySelector('input[type="tel"]') as HTMLInputElement;
    await user.click(phone);
    await user.keyboard('+919978776554');

    const password = container.querySelector('input[type="password"]') as HTMLInputElement;
    await user.click(password);
    await user.keyboard('pass123456');

    // Regiter with button should be disabled by default
    const continueButton = screen.getByTestId('SubmitButton');
    expect(continueButton).toHaveAttribute('disabled');
  });

  it('should submit the form correctly', async () => {
    const { container } = render(wrapper);

    const userName = (await container.querySelector('input[name="name"]')) as HTMLInputElement;
    userEvent.type(userName, 'Jane Doe');

    const phone = (await container.querySelector('input[type="tel"]')) as HTMLInputElement;
    userEvent.type(phone, '+919978776554');

    const password = (await container.querySelector('input[type="password"]')) as HTMLInputElement;
    userEvent.type(password, 'pass123456');

    // let's mock successful registration submission
    const responseData = {
      values: { username: 'Jane Doe', phone: '+919978776554', password: 'pass123456' },
    };
    mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));

    // click on continue
    await waitFor(() => {
      const continueButton = screen.getByText('Register with');
      // userEvent.click(continueButton);
    });

    // TODOS: we need to test successful response
    // await waitFor(() => {
    //   const authContainer = screen.getByTestId('AuthContainer');
    //   expect(authContainer).toHaveTextContent(
    //     'Please confirm the OTP received at your WhatsApp number.'
    //   );
    // });
  });
});
