import React from 'react';
import { render, wait } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { StaffManagementList } from './StaffManagementList';
import { STAFF_MANAGEMENT_MOCKS } from '../StaffManagement.test.helper';
import { mount } from 'enzyme';
import { List } from '../../List/List';
import * as something  from '../../../context/role';





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

  await wait();

  expect(getByText('Staff Management')).toBeInTheDocument();
  await wait();
});

test('check restricted action',async()=>{
  const wrapper=mount(staffManagement);
  await wait();
  wrapper.find(List).prop('restrictedAction')({roles:['Admin']})
  
})

test('check restricted action with manager role',async()=>{
  something.isManagerRole=true
  const wrapper=mount(staffManagement);
  await wait();
  wrapper.find(List).prop('restrictedAction')({roles:['Admin']})
})

test('check getColumns function call',async()=>{
  const wrapper=mount(staffManagement);
  await wait();
  wrapper.find(List).prop('columns')({name:'Alex',phone:'9897123456',groups:['Default'],roles:['Admin']})
})
