import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';
import { StaffManagement } from './StaffManagement';
import {
  STAFF_MANAGEMENT_MOCKS,
  STAFF_MANAGEMENT_MOCKS_ADMIN_ROLE,
  STAFF_MANAGEMENT_MOCKS_MANAGER_ROLE,
  STAFF_MANAGEMENT_MOCKS_WITH_EMPTY_ROLES,
} from './StaffManagement.test.helper';
import * as Notification from 'common/notification';
import * as Utils from 'common/utils';
import * as Role from 'context/role';
import * as Services from 'services/AuthService';

const arrowDown = (element: any, noOfTimes: number) => {
  for (let i = 0; i < noOfTimes; i++) {
    fireEvent.keyDown(element, { key: 'ArrowDown' });
  }
};

vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...mod,
    useParams: () => ({
      id: '1',
    }),
  };
});

beforeEach(() => {
  vi.restoreAllMocks();
});

const mocks = STAFF_MANAGEMENT_MOCKS;

const staffManagement = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <StaffManagement />
    </Router>
  </MockedProvider>
);

test('should load the staff user edit form', async () => {
  render(staffManagement);

  await waitFor(() => {
    const submitButton = screen.getByRole('button', { name: 'Save' });
    expect(submitButton).toBeInTheDocument();
  });
  const submitButton = screen.getByRole('button', { name: 'Save' });
  fireEvent.click(submitButton);

  await waitFor(() => {});
});

test('it should have a help link', async () => {
  render(staffManagement);

  // loading is show initially
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    const helpButton = screen.getByTestId('helpButton');
    fireEvent.click(helpButton);
  });

  expect(screen.getByText('User roles')).toBeInTheDocument();

  const closeButton = screen.getByRole('button', { name: 'Close' });
  expect(closeButton).toBeInTheDocument();

  fireEvent.click(closeButton);
  await waitFor(() => {});
});

test('it should load with the initial values', async () => {
  render(staffManagement);
  await waitFor(() => {
    expect(screen.getByPlaceholderText('Username')).toHaveValue('Staff');
    expect(screen.getByPlaceholderText('Phone Number')).toHaveValue('919999988888');
  });
});

test('change the role from staff to Admin', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  render(staffManagement);
  await waitFor(() => {
    expect(screen.getByPlaceholderText('Username')).toHaveValue('Staff');
    expect(screen.getByPlaceholderText('Phone Number')).toHaveValue('919999988888');
  });

  await waitFor(() => {
    expect(screen.getAllByTestId('AutocompleteInput')[0].querySelector('input')).toHaveValue(
      'Staff'
    );
  });

  const [roles] = screen.getAllByTestId('autocomplete-element');
  roles.focus();
  fireEvent.keyDown(roles, { key: 'ArrowDown' });
  fireEvent.keyDown(roles, { key: 'ArrowDown' });
  fireEvent.keyDown(roles, { key: 'Enter' });

  fireEvent.click(screen.getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});

test('can select multiple roles if dynamic roles are enabled', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  const utilSpy = vi.spyOn(Utils, 'organizationHasDynamicRole');
  utilSpy.mockImplementation(() => true);

  render(staffManagement);

  await waitFor(() => {
    expect(screen.getByPlaceholderText('Username')).toHaveValue('Staff');
    expect(screen.getByPlaceholderText('Phone Number')).toHaveValue('919999988888');
  });
  await waitFor(() => {
    expect(screen.getAllByTestId('searchChip')[0].querySelector('span')).toHaveTextContent('Staff');
  });
  const [roles] = screen.getAllByTestId('autocomplete-element');
  roles.focus();
  fireEvent.keyDown(roles, { key: 'ArrowDown' });
  fireEvent.keyDown(roles, { key: 'ArrowDown' });
  fireEvent.keyDown(roles, { key: 'Enter' });

  await waitFor(() => {
    expect(screen.getAllByTestId('searchChip')[0].querySelector('span')).toHaveTextContent('Staff');
    expect(screen.getAllByTestId('searchChip')[1].querySelector('span')).toHaveTextContent(
      'Manager'
    );
  });

  fireEvent.click(screen.getByTestId('submitActionButton'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});

test('return error if roles api does not have data', async () => {
  render(
    <MockedProvider mocks={STAFF_MANAGEMENT_MOCKS_WITH_EMPTY_ROLES} addTypename={false}>
      <Router>
        <StaffManagement />
      </Router>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(
      screen.getByText('An error occured! Not able to fetch collections or roles')
    ).toBeInTheDocument();
  });
});

test('if the user is manager they should not see Admin role in the list', async () => {
  const roleSpy = vi.spyOn(Role, 'getUserRole');
  roleSpy.mockImplementation(() => ['Manager']);
  render(
    <MockedProvider mocks={STAFF_MANAGEMENT_MOCKS_MANAGER_ROLE} addTypename={false}>
      <Router>
        <StaffManagement />
      </Router>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.getByPlaceholderText('Username')).toHaveValue('Manager');
    expect(screen.getByPlaceholderText('Phone Number')).toHaveValue('919999988777');
  });

  await waitFor(() => {
    expect(screen.getAllByTestId('AutocompleteInput')[0].querySelector('input')).toHaveValue(
      'Manager'
    );
  });

  const [roles] = screen.getAllByTestId('autocomplete-element');
  roles.focus();
  fireEvent.keyDown(roles, { key: 'ArrowDown' });

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('Staff');
    expect(screen.getAllByRole('option')[1]).toHaveTextContent('Manager');
    expect(screen.getAllByRole('option')[2]).toHaveTextContent('No access');
  });
});

test('if the user is Admin they should not see Glific admin role in the list', async () => {
  const roleSpy = vi.spyOn(Role, 'getUserRole');
  roleSpy.mockImplementation(() => ['Admin']);
  render(
    <MockedProvider mocks={STAFF_MANAGEMENT_MOCKS_ADMIN_ROLE} addTypename={false}>
      <Router>
        <StaffManagement />
      </Router>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.getByPlaceholderText('Username')).toHaveValue('Admin');
    expect(screen.getByPlaceholderText('Phone Number')).toHaveValue('919999984444');
  });

  await waitFor(() => {
    expect(screen.getAllByTestId('AutocompleteInput')[0].querySelector('input')).toHaveValue(
      'Admin'
    );
  });

  const [roles] = screen.getAllByTestId('autocomplete-element');
  roles.focus();
  fireEvent.keyDown(roles, { key: 'ArrowDown' });

  await waitFor(() => {
    expect(screen.getAllByRole('option')).toHaveLength(4);
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('Admin');
    expect(screen.getAllByRole('option')[1]).toHaveTextContent('Staff');
    expect(screen.getAllByRole('option')[2]).toHaveTextContent('Manager');
    expect(screen.getAllByRole('option')[3]).toHaveTextContent('No access');
  });
});

test('changing to staff role shows a checkbox', async () => {
  const utilSpy = vi.spyOn(Utils, 'organizationHasDynamicRole');
  utilSpy.mockImplementation(() => true);

  render(staffManagement);

  await waitFor(() => {
    expect(screen.getByPlaceholderText('Username')).toHaveValue('Staff');
    expect(screen.getByPlaceholderText('Phone Number')).toHaveValue('919999988888');
  });
  await waitFor(() => {
    expect(screen.getAllByTestId('searchChip')[0].querySelector('span')).toHaveTextContent('Staff');
  });
  const [roles] = screen.getAllByTestId('autocomplete-element');
  roles.focus();
  arrowDown(roles, 2);
  fireEvent.keyDown(roles, { key: 'Enter' });

  roles.focus();
  arrowDown(roles, 4);
  fireEvent.keyDown(roles, { key: 'Enter' });

  await waitFor(() => {
    expect(screen.getAllByTestId('searchChip')[0].querySelector('span')).toHaveTextContent('Staff');
    expect(
      screen.getByText('Can chat with contacts from assigned collection only')
    ).toBeInTheDocument();
  });
});

test('unset all roles and then set admin role', async () => {
  render(staffManagement);

  await waitFor(() => {
    expect(screen.getByPlaceholderText('Username')).toHaveValue('Staff');
    expect(screen.getByPlaceholderText('Phone Number')).toHaveValue('919999988888');
  });

  await waitFor(() => {
    expect(screen.getAllByTestId('AutocompleteInput')[0].querySelector('input')).toHaveValue(
      'Staff'
    );
  });
  const clearButton = screen.getAllByTestId('CloseIcon')[0];
  fireEvent.click(clearButton);

  const [roles] = screen.getAllByTestId('autocomplete-element');
  roles.focus();
  arrowDown(roles, 2);
  fireEvent.keyDown(roles, { key: 'Enter' });

  await waitFor(() => {
    expect(screen.getAllByTestId('AutocompleteInput')[0].querySelector('input')).toHaveValue(
      'Admin'
    );
  });
});

test('admin should logout if they demote their own role', async () => {
  const notificationSpy = vi.spyOn(Notification, 'setNotification');
  const serviceSpy = vi.spyOn(Services, 'getUserSession');
  serviceSpy.mockImplementation((props) => {
    if (props === 'id') {
      return '1';
    } else if (props === 'roles') {
      return [{ id: '1', label: 'Admin' }];
    }
  });
  render(
    <MockedProvider mocks={STAFF_MANAGEMENT_MOCKS_ADMIN_ROLE} addTypename={false}>
      <Router>
        <StaffManagement />
      </Router>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.getAllByTestId('AutocompleteInput')[0].querySelector('input')).toHaveValue(
      'Admin'
    );
  });

  const [roles] = screen.getAllByTestId('autocomplete-element');
  roles.focus();
  arrowDown(roles, 2);
  fireEvent.keyDown(roles, { key: 'Enter' });

  const submitButton = screen.getByRole('button', { name: 'Save' });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});
