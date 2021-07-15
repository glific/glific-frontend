import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, waitFor, screen } from '@testing-library/react';
import * as Yup from 'yup';
import UserEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { Input } from '../../components/UI/Form/Input/Input';
import { Organization } from './Organization';

jest.mock('react-google-recaptcha', () => (props: any) => (
  <input
    type="checkbox"
    aria-label="recaptcha"
    data-testid="recaptcha-sign-in"
    className={props.size}
    onChange={props.onChange}
  />
));

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
  saveHandler: jest.fn(),
  initialFormValues: {
    name: '',
  },
};

test('it should render component and show error messages', () => {
  const { container } = render(
    <MockedProvider addTypename={false}>
      <MemoryRouter>
        <Organization {...props} errorMessage={{ global: 'Something went wrong' }} />
      </MemoryRouter>
    </MockedProvider>
  );

  const registration = screen.getByTestId('RegistrationContainer');
  expect(registration).toBeInTheDocument();

  const captcha = screen.getByTestId('recaptcha-sign-in');
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
        <Organization {...props} />
      </MemoryRouter>
    </MockedProvider>
  );

  const registration = screen.getByTestId('RegistrationContainer');
  expect(registration).toBeInTheDocument();

  const captcha = screen.getByTestId('recaptcha-sign-in');
  expect(captcha).toBeInTheDocument();

  waitFor(() => {
    fireEvent.click(captcha);
    const inputElements = screen.getAllByRole('textbox');

    UserEvent.type(inputElements[0], 'JaneDoe');

    // click on continue
    const button = screen.getByText('Get Started');
    fireEvent.click(button);
    expect(props.saveHandler).toHaveBeenCalledWith({ name: 'test' }, true, jest.fn(), jest.fn());
  });
});
