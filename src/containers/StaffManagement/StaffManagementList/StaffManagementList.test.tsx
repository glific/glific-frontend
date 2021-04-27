import { fireEvent, render, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { StaffManagementList } from './StaffManagementList';
import { STAFF_MANAGEMENT_MOCKS } from '../StaffManagement.test.helper';
import { setUserSession } from '../../../services/AuthService';

jest.mock('../../List/List', () => {
  return {
    List: (...props: any) => {
      const { restrictedAction } = props[0];
      return (
        <div onClick={() => restrictedAction({ roles: ['Admin'] })} data-testid="staffList">
          <span>Staff Management</span>
        </div>
      );
    },
  };
});

const mocks = STAFF_MANAGEMENT_MOCKS;

const staffManagement = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <StaffManagementList />
    </Router>
  </MockedProvider>
);

test('StaffManagementList is rendered correctly', async () => {
  const { getByText } = render(staffManagement);

  await waitFor(() => {
    expect(getByText('Staff Management')).toBeInTheDocument();
  });
});

test('check restricted action with manager role', async () => {
  setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Staff'] }));

  const { getByTestId } = render(staffManagement);
  await waitFor(() => {
    fireEvent.click(getByTestId('staffList'));
  });
});
