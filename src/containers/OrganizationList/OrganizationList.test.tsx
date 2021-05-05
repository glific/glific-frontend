import { render, cleanup, fireEvent, act, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import UserEvent from '@testing-library/user-event';
import OrganizationList from './OrganizationList';
import { getAllOrganizations } from '../../mocks/Organization';
import { BrowserRouter as Router } from 'react-router-dom';
import { setUserSession } from '../../services/AuthService';

afterEach(cleanup);
const mocks = getAllOrganizations;
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const list = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <OrganizationList />
    </Router>
  </MockedProvider>
);

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));

test('Organization list renders correctly', async () => {
  render(list);

  expect(screen.getByText('Loading...')).toBeInTheDocument();
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  const label = await screen.findByText('Organizations');
  const nameLabel = await screen.findByText('NAME');
  const isActiveLabel = await screen.findByText('IS ACTIVE');
  const actionLabel = await screen.findByText('ACTIONS');

  expect(label).toBeInTheDocument();
  expect(nameLabel).toBeInTheDocument();
  expect(isActiveLabel).toBeInTheDocument();
  expect(actionLabel).toBeInTheDocument();
});

test('Perform button actions on Org List', async () => {
  render(list);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  const label = await screen.findByText('Organizations');
  const approveButton = screen.getAllByRole('button', {
    name: 'Unblock.svg',
  })[0];
  const activateButton = screen.getAllByRole('button', {
    name: 'Remove.svg',
  })[0];

  expect(label).toBeInTheDocument();
  expect(approveButton).toBeInTheDocument();
  expect(activateButton).toBeInTheDocument();

  fireEvent.click(approveButton);
  fireEvent.click(activateButton);

  const deleteButton = screen.getByRole('button', { name: 'Delete' });
  expect(deleteButton).toBeInTheDocument();
  fireEvent.click(deleteButton);

  const confirmationInput = screen.getByRole('textbox');
  UserEvent.type(confirmationInput, 'Test');

  expect(confirmationInput).toBeInTheDocument();
  expect(confirmationInput).toHaveValue('Test');

  const confirmDeleteButton = screen.getByText('Confirm');
  expect(confirmDeleteButton).toBeInTheDocument();

  fireEvent.click(confirmDeleteButton);
});
