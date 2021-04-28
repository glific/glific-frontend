import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import * as Yup from 'yup';
import UserEvent from '@testing-library/user-event';

import { MemoryRouter } from 'react-router-dom';
import { Input } from '../../components/UI/Form/Input/Input';
import { Organization } from './Organization';
import { act } from 'react-dom/test-utils';

const schema = Yup.object().shape({
  name: Yup.string().required('NGO name is required'),
});

const props = {
  pageTitle: 'Setup your NGO on Glific',
  buttonText: 'GET STARTED',
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
  errorMessage: { global: 'Something went wrong' },
};

const wrapper = (
  <MockedProvider addTypename={false}>
    <MemoryRouter>
      <Organization {...props} />
    </MemoryRouter>
  </MockedProvider>
);

test('it should render component and show error messages', async () => {
  const { container, findByTestId } = render(wrapper);

  const registration = await findByTestId('RegistrationContainer');
  expect(registration).toBeInTheDocument();

  const submit = await findByTestId('SubmitButton');
  act(() => {
    UserEvent.click(submit);
  });

  expect(container.getElementsByClassName('ErrorMessage')[0]).toBeInTheDocument();
});
