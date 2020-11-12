import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { StaffManagementList } from './StaffManagementList';
import { STAFF_MANAGEMENT_MOCKS } from '../StaffManagement.test.helper';
import { List } from '../../List/List';
import * as something from '../../../context/role';

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

// test('check restricted action',async()=>{
//   const wrapper=render(staffManagement);
//   await wait();
//   wrapper.find(List).prop('restrictedAction')({roles:['Admin']})

// })

// test('check restricted action with manager role',async()=>{
//   something.isManagerRole=true
//   const wrapper=render(staffManagement);
//   await wait();
//   wrapper.find(List).prop('restrictedAction')({roles:['Admin']})
// })

// test('check getColumns function call',async()=>{
//   const wrapper=render(staffManagement);
//   await wait();
//   wrapper.find(List).prop('columns')({name:'Alex',phone:'9897123456',groups:['Default'],roles:['Admin']})
// })
