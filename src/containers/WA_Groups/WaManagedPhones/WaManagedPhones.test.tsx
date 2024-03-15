import { MockedProvider } from '@apollo/client/testing';
import { GET_WA_MANAGED_PHONES } from 'graphql/queries/WA_Groups';
import WaManagedPhones from './WaManagedPhones';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { setNotification } from 'common/notification';
import { SYNC_GROUPS } from 'graphql/mutations/Group';

const mock = [
  {
    request: {
      query: GET_WA_MANAGED_PHONES,
      variables: {
        filter: {},
        opts: {
          limit: 3,
        },
      },
    },
    response: {
      waManagedPhones: [
        {
          __typename: 'WaManagedPhone',
          id: '1',
          label: null,
          phone: '7535988655',
        },
        {
          __typename: 'WaManagedPhone',
          id: '2',
          label: null,
          phone: '411395483',
        },
        {
          __typename: 'WaManagedPhone',
          id: '3',
          label: null,
          phone: '2666135435',
        },
      ],
    },
  },
  {
    request: {
      query: SYNC_GROUPS,
    },
    result: {
      data: {
        syncWaGroupContacts: {
          __typename: 'SyncWaContacts',
          message: 'successfully synced',
        },
      },
    },
  },
];

const wrapper = (
  <MockedProvider mocks={mock}>
    <WaManagedPhones phonenumber={[]} setPhonenumber={vi.fn()} />
  </MockedProvider>
);

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
  };
});

test('it should render the dropdown correctly', async () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('AutocompleteInput')).toBeInTheDocument();
});

test('it should render the sync button correctly', async () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('syncGroups')).toBeInTheDocument();
});

test('it should render loading inside sync button on click', async () => {
  const { getByTestId } = render(wrapper);
  let syncButton = getByTestId('syncGroups');

  fireEvent.click(syncButton);

  await waitFor(() => {
    expect(getByTestId('loading')).toBeInTheDocument();
  });
});

test('it should sync groups contacts', async () => {
  const { getByTestId } = render(wrapper);
  let syncButton = getByTestId('syncGroups');

  fireEvent.click(syncButton);

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});
