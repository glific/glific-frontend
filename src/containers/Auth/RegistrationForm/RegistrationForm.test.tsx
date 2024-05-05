import { MemoryRouter, Route, Routes } from 'react-router';
import RegistrationForm from './ResgistrationForm';
import { fireEvent, render, waitFor } from '@testing-library/react';

const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUsedNavigate,
}));

const renderForm = (id: number) => (
  <MemoryRouter initialEntries={[`/registration/${id}`]}>
    <Routes>
      <Route path="/registration/:step" element={<RegistrationForm />} />
    </Routes>
  </MemoryRouter>
);

test('it should render platform details page', async () => {
  const { getByTestId } = render(renderForm(1));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Glific platform details');
  });
});

test('it should render platform details page', async () => {
  const { getByTestId } = render(renderForm(2));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('About the organization');
  });
});

test('it should render platform details page', async () => {
  const { getByTestId } = render(renderForm(3));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Payment details');
  });
});

test('it should render platform details page', async () => {
  const { getByTestId } = render(renderForm(4));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Submitter & Signing authority details');
  });

  fireEvent.click(getByTestId('back-button'));
});

test.only('it should fill the form', async () => {
  const { getByTestId, getAllByRole, getAllByTestId } = render(renderForm(1));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Glific platform details');
  });

  const inputFields = getAllByRole('textbox');
  const [phoneNumber, appName, apiKeys, shortcode] = inputFields;

  fireEvent.change(phoneNumber, { target: { value: '9675937589' } });
  fireEvent.change(appName, { target: { value: 'glific app' } });
  fireEvent.change(apiKeys, { target: { value: 'api key' } });
  fireEvent.change(shortcode, { target: { value: 'glific' } });

  fireEvent.click(getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('About the organization');
  });

  const inputFieldsOrgdetails = getAllByRole('textbox');
  const [orgname, gstNumber, registeredAddress, currentAddress] = inputFieldsOrgdetails;

  fireEvent.change(orgname, { target: { value: 'org name' } });
  fireEvent.change(gstNumber, { target: { value: '123456789000000' } });
  fireEvent.change(registeredAddress, { target: { value: 'add 1' } });
  fireEvent.change(currentAddress, { target: { value: 'add 2' } });

  fireEvent.click(getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Payment details');
  });

  const inputFieldsPaymentdetails = getAllByRole('textbox');
  const [name, designation, phone, email] = inputFieldsPaymentdetails;

  const radioButtons = getAllByTestId('radio-btn');
  fireEvent.click(radioButtons[1]);

  fireEvent.change(name, { target: { value: 'Default finance poc name' } });
  fireEvent.change(designation, { target: { value: 'finance' } });
  fireEvent.change(phone, { target: { value: '9758365738' } });
  fireEvent.change(email, { target: { value: 'finance@email.com' } });

  fireEvent.click(getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(getByTestId('heading')).toHaveTextContent('Submitter & Signing authority details');
  });

  const inputFieldssigningdetails = getAllByRole('textbox');
  const [
    submitterName,
    submitterEmail,
    signingAuthorityName,
    signingAuthorityDesignation,
    signingAuthorityEmail,
  ] = inputFieldssigningdetails;

  fireEvent.change(submitterName, { target: { value: 'Default submitter name' } });
  fireEvent.change(submitterEmail, { target: { value: 'submitter' } });

  fireEvent.change(signingAuthorityName, { target: { value: 'Default signing authority name' } });
  fireEvent.change(signingAuthorityDesignation, { target: { value: 'signing authority' } });
  fireEvent.change(signingAuthorityEmail, { target: { value: 'signing@email.com' } });

  fireEvent.click(getByTestId('submitActionButton'));
});
