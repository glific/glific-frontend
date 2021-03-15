import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { TriggerList } from './TriggerList';
import { MockedProvider } from '@apollo/client/testing';
import { triggerListQuery, triggerCountQuery } from '../../../mocks/Trigger';
import { MemoryRouter } from 'react-router-dom';
import { setUserSession } from '../../../services/AuthService';

const mocks = [triggerListQuery, triggerCountQuery];

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <TriggerList />
    </MemoryRouter>
  </MockedProvider>
);

setUserSession(JSON.stringify({ roles: ['Admin'] }));

test('should load the trigger list', async () => {
  const { getByText } = render(wrapper);

  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Triggers')).toBeInTheDocument();
  });
});

test('click on Make a copy', async () => {
  const { container } = render(wrapper);
  await waitFor(() => {
    expect(container.querySelector('#additionalButton-icon')).toBeInTheDocument();
    fireEvent.click(container.querySelector('#additionalButton-icon'));
  });
});
