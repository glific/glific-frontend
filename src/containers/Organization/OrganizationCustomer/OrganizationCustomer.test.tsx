import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { OrganizationCustomer } from './OrganizationCustomer';
import { setUserSession } from '../../../services/AuthService';
import { organizationCustomerMock } from '../../../mocks/Billing';

const mocks = [...organizationCustomerMock];
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Glific_admin'] }));

test('it renders organization-customer component successfully without form data', async () => {
  const app = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <OrganizationCustomer match={{ params: { id: '2' } }} openDialog />
    </MockedProvider>
  );
  render(app);
  await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));

  const [name, email, currency] = screen.getAllByRole('textbox');
  const tds = screen.getByRole('spinbutton');

  fireEvent.change(name, { target: { value: 'testing' } });
  fireEvent.change(email, { target: { value: 'testing@example.com' } });
  fireEvent.change(currency, { target: { value: 'inr' } });
  fireEvent.change(tds, { target: { value: 4 } });

  await waitFor(() => {});

  const submitButton = screen.getByRole('button', { name: 'Save' });
  fireEvent.click(submitButton);

  await waitFor(() => {});
});

test('it renders organization-customer component successfully with form data', async () => {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <OrganizationCustomer match={{ params: { id: '1' } }} openDialog />
    </MockedProvider>
  );
  await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));

  const submitButton = screen.getByRole('button', { name: 'Save' });
  fireEvent.click(submitButton);

  await waitFor(() => {});
});
