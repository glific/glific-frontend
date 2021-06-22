import { render, fireEvent, waitFor, prettyDOM } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { StaffManagement } from './StaffManagement';
import { STAFF_MANAGEMENT_MOCKS } from './StaffManagement.test.helper';

const mocks = STAFF_MANAGEMENT_MOCKS;

const staffManagement = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <StaffManagement match={{ params: { id: 1 } }} />
  </MockedProvider>
);

test('should load the staff user edit form', async () => {
  const { container } = render(staffManagement);

  await waitFor(async () => await new Promise((resolve) => setTimeout(resolve, 0)));

  console.log(prettyDOM(container));
});

test('it should have a help link', async () => {
  const { getByText, findByTestId } = render(staffManagement);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  const helpButton = await findByTestId('helpButton');
  fireEvent.click(helpButton);
  expect(getByText('User roles')).toBeInTheDocument();
});
