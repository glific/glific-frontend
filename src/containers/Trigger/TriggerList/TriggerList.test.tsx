import { render, waitFor, fireEvent, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';

import { triggerListQuery, triggerCountQuery } from 'mocks/Trigger';
import { setUserSession } from 'services/AuthService';
import { TriggerList } from './TriggerList';

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
  const { getByText, getByTestId } = render(wrapper);

  expect(getByTestId('loading')).toBeInTheDocument();
  await waitFor(() => {
    expect(getByText('Triggers')).toBeInTheDocument();
  });
});

test('click on Make a copy', async () => {
  const { getAllByTestId } = render(wrapper);

  await waitFor(() => {
    expect(getAllByTestId('MoreIcon')[0]).toBeInTheDocument();
  });

  fireEvent.click(getAllByTestId('MoreIcon')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('additionalButton')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('additionalButton'));
  });
});

test('hover over tooltip', async () => {
  const { container, getAllByTestId, getByText } = render(wrapper);
  await waitFor(() => {
    const tooltip = getAllByTestId('tooltip')[0];
    fireEvent.mouseOver(tooltip);
  });

  await waitFor(() => {
    expect(getByText('Repeat: weekly(Mon,Tue)'));
  });
});
