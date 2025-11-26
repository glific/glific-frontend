import { render, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';

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
const mockedUsedNavigate = vi.fn();
vi.mock('react-router', async () => {
  return {
    ...(await vi.importActual<any>('react-router')),
    useLocation: () => ({ state: 'copy', pathname: '/flow/1/edit' }),
    useParams: () => ({ id: 1 }),
    useNavigate: () => mockedUsedNavigate,
  };
});

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
    expect(getAllByTestId('copy-trigger')[0]).toBeInTheDocument();
    fireEvent.click(getAllByTestId('copy-trigger')[0]);
  });
});

test('hover over tooltip', async () => {
  const { getAllByTestId, getByText } = render(wrapper);
  await waitFor(() => {
    const tooltip = getAllByTestId('tooltip')[0];
    fireEvent.mouseOver(tooltip);
  });

  await waitFor(() => {
    expect(getByText('Repeat: weekly(Mon,Tue)'));
  });
});

test('should navigate to edit page on clicking the view button', async () => {
  const { getAllByTestId, getByText } = render(wrapper);

  await waitFor(() => {
    expect(getByText('Triggers')).toBeInTheDocument();
  });

  fireEvent.click(getAllByTestId('view-trigger')[0]);
  await waitFor(() => {
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/trigger/1/edit');
  });
});
