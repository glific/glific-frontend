import React from 'react';
import { render, wait, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';

import { GroupContact } from './GroupContact';
import { countGroupContactsQuery } from '../../../mocks/Contact';
import { getGroupQuery } from '../../../mocks/Group';

const mocks = [countGroupContactsQuery, getGroupQuery, getGroupQuery];

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <GroupContact match={{ params: { id: 1 } }} />
    </MemoryRouter>
  </MockedProvider>
);

describe('<GroupContact />', () => {
  test('should render GroupContact', async () => {
    const { getByText } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Back to all groups')).toBeInTheDocument();
    });
  });
});
