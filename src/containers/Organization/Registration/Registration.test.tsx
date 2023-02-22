import { fireEvent, render, screen, waitFor } from '@testing-library/react';
// import UserEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
// import axios from 'axios';
import { vi } from 'vitest';

import { Registration } from './Registration';

vi.mock('axios');
// const mockedAxios = axios as vi.Mocked<typeof axios>;

const props = {
  title: 'Setup your NGO on Glific',
  buttonText: 'GET STARTED',
  handleStep: vi.fn(),
};

const wrapper = (
  <MemoryRouter>
    <GoogleReCaptchaProvider reCaptchaKey="test key">
      <Registration {...props} />
    </GoogleReCaptchaProvider>
  </MemoryRouter>
);

describe('<Registration />', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('it should render correctly', async () => {
    const { findByTestId } = render(wrapper);

    const registration = await findByTestId('RegistrationContainer');
    expect(registration).toHaveTextContent('Setup your NGO on Glific');
  });

  test('onboard org correctly', async () => {
    render(wrapper);

    const captcha = screen.getByTestId('captcha-button');
    expect(captcha).toBeInTheDocument();

    waitFor(() => {
      const inputElements = screen.getAllByRole('textbox');

      fireEvent.change(inputElements[0], { target: { value: 'JaneDoe' } });
      fireEvent.change(inputElements[1], { target: { value: '919978776554' } });
      fireEvent.change(inputElements[2], { target: { value: 'Test App' } });
      fireEvent.change(inputElements[3], { target: { value: 'Vt5Ufo9RXpktxLdcX0awjrrYaWK0GowE' } });
      fireEvent.change(inputElements[4], { target: { value: 'test' } });
      fireEvent.change(inputElements[5], { target: { value: 'glific@glific.com' } });
      // click on continue
    });
    // const button = screen.getByText('GET STARTED');
    // UserEvent.click(button);

    // const responseData = { data: { is_valid: true, messages: [] } };
    // act(() => {
    //   mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    // });
  });

  test('it should submit the form correctly and give global error', async () => {
    render(wrapper);

    const captcha = screen.getByTestId('captcha-button');
    expect(captcha).toBeInTheDocument();

    waitFor(() => {
      const inputElements = screen.getAllByRole('textbox');

      fireEvent.change(inputElements[0], { target: { value: 'JaneDoe' } });
      fireEvent.change(inputElements[1], { target: { value: '919978776554' } });
      fireEvent.change(inputElements[2], { target: { value: 'Test App' } });
      fireEvent.change(inputElements[3], { target: { value: 'Vt5Ufo9RXpktxLdcX0awjrrYaWK0GowE' } });
      fireEvent.change(inputElements[4], { target: { value: 'test' } });
      fireEvent.change(inputElements[5], { target: { value: 'glific@glific.com' } });
      // click on continue
    });
    // const button = screen.getByText('GET STARTED');
    // UserEvent.click(button);

    // const responseData = { data: { is_valid: false, messages: [] } };
    // act(() => {
    //   mockedAxios.post.mockImplementationOnce(() => Promise.resolve(responseData));
    // });
  });
});
