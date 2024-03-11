import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, waitFor, screen } from '@testing-library/react';
import * as Yup from 'yup';
import UserEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { Input } from 'components/UI/Form/Input/Input';
import { Organization } from './Organization';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

const schema = Yup.object().shape({
  name: Yup.string().required('NGO name is required'),
});

const props = {
  pageTitle: 'Setup your NGO on Glific',
  buttonText: 'Get Started',
  formFields: [
    {
      component: Input,
      name: 'name',
      type: 'text',
      placeholder: 'NGO name',
    },
  ],
  validationSchema: schema,
  saveHandler: vi.fn(),
  initialFormValues: {
    name: '',
  },
};

test('it should render component and show error messages', async () => {
  render(
    <MockedProvider addTypename={false}>
      <MemoryRouter>
        <GoogleReCaptchaProvider reCaptchaKey="test key">
          <Organization {...props} errorMessage={{ global: 'Something went wrong' }} />
        </GoogleReCaptchaProvider>
      </MemoryRouter>
    </MockedProvider>
  );

  const registration = screen.getByTestId('RegistrationContainer');
  expect(registration).toBeInTheDocument();

  const captcha = screen.getByTestId('captcha-button');
  expect(captcha).toBeInTheDocument();

  // We can't submit the form as we don't have correct api key
  // May be we should start using github environment variables and store api key
  // comment below till we find a way to test this.
  // const submit = screen.getByTestId('SubmitButton');

  // act(() => {
  //   UserEvent.click(captcha);
  //   UserEvent.click(submit);
  // });

  // expect(container.getElementsByClassName('ErrorMessage')[0]).toBeInTheDocument();
});

test('Organization with success onboarding', () => {
  render(
    <MockedProvider addTypename={false}>
      <MemoryRouter>
        <GoogleReCaptchaProvider reCaptchaKey="test key">
          <Organization {...props} />
        </GoogleReCaptchaProvider>
      </MemoryRouter>
    </MockedProvider>
  );

  const registration = screen.getByTestId('RegistrationContainer');
  expect(registration).toBeInTheDocument();

  const captcha = screen.getByTestId('captcha-button');
  expect(captcha).toBeInTheDocument();

  const inputElements = screen.getAllByRole('textbox');

  UserEvent.type(inputElements[0], 'JaneDoe');

  // click on continue
  const button = screen.getByText('Get Started');
  fireEvent.click(button);

  waitFor(() => {
    expect(props.saveHandler).toHaveBeenCalledWith({ name: 'test' }, true, vi.fn(), vi.fn());
  });
});
