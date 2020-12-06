import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { GroupList } from './GroupList';
import { countGroupQuery, filterGroupQuery, getGroupContactsQuery } from '../../../mocks/Group';
import { MemoryRouter } from 'react-router';
import { getContactsQuery } from '../../../mocks/Contact';
import { setUserSession } from '../../../services/AuthService';
import { getCurrentUserQuery } from '../../../mocks/User';

const mocks = [
  countGroupQuery,
  filterGroupQuery,
  filterGroupQuery,
  getGroupContactsQuery,
  getContactsQuery,
  getCurrentUserQuery,
];

const wrapper = (
  <MemoryRouter>
    <MockedProvider mocks={mocks} addTypename={false}>
      <GroupList />
    </MockedProvider>
  </MemoryRouter>
);

describe('<GroupList />', () => {
  test('should render GroupList', async () => {
    const { getByText } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Groups')).toBeInTheDocument();
    });

    // TODO: test flows

    // TODO: test delete
  });

  test('it should have add contact to group dialog box ', async () => {
    setUserSession(JSON.stringify({ roles: ['Admin'] }));
    const { getByText, getAllByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getAllByTestId('additionalButton')[0]).toBeInTheDocument();
    });

    await waitFor(() => {
      fireEvent.click(getAllByTestId('additionalButton')[0]);
    });

    expect(getByText('Add contacts to the group')).toBeInTheDocument();
  });

  test('it should have send message dialog box ', async () => {
    setUserSession(JSON.stringify({ roles: ['Admin'] }));
    const { getByText, getAllByTestId, getByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByText('Send a message')).toBeInTheDocument();
    });

    await waitFor(() => {
      fireEvent.click(getAllByTestId('MenuItem')[0]);
    });

    expect(getByText('Send message to group')).toBeInTheDocument();
  });
});
