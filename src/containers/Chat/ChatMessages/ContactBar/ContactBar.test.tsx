import React from 'react';
import { render, screen, wait } from '@testing-library/react';

import { MockedProvider } from '@apollo/client/testing';
import ContactBar from './ContactBar';
import { contactGroupsQuery } from '../ChatMessages.test.helper';

const mocks = [contactGroupsQuery];

const defaultProps = {
  contactName: 'Jane Doe',
  contactId: '2',
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

  await wait();
  expect(getByText('Default Group, Staff Group')).toBeInTheDocument();
});
