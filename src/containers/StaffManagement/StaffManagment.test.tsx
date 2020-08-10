import React from 'react';
import { render, wait } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import { StaffManagement } from './StaffManagement';
import { Switch, Route } from 'react-router-dom';
import { StaffManagementList } from './StaffManagementList/StaffManagementList';
import { STAFF_MANAGEMENT_MOCKS } from './StaffManagement.test.helper';

const mocks = STAFF_MANAGEMENT_MOCKS;

test('User edif form is loaded correctly', async () => {
  const { getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <Switch>
          <Route path="/staff-management" exact component={StaffManagementList} />
        </Switch>
        <StaffManagement match={{ params: { id: 1 } }} />
      </Router>
    </MockedProvider>
  );
  await wait();
  expect(getByText('Edit User')).toBeInTheDocument();
});
