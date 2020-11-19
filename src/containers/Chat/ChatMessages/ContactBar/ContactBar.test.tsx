import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { MockedProvider } from '@apollo/client/testing';
import ContactBar from './ContactBar';
import { contactGroupsQuery } from '../../../../mocks/Contact';

const mocks = [contactGroupsQuery];

const defaultProps = {
  contactName: 'Jane Doe',
  contactId: '2',
  lastMessageTime: new Date(),
};

const component = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <ContactBar {...defaultProps} />
  </MockedProvider>
);

test('it should render the name correctly', async () => {
  const { getByText } = render(component);

  const contactBarComponent = screen.getByTestId('beneficiaryName');
  expect(contactBarComponent).toBeInTheDocument();
  expect(getByText('Jane Doe')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Default Group, Staff Group')).toBeInTheDocument();
  });
});

test('it should have a session timer', async () => {
  const { getByText } = render(component);
  await waitFor(() => {
    expect(getByText('24')).toBeInTheDocument();
  });
});
