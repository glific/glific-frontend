import { MockedProvider } from '@apollo/client/testing';
import WaManagedPhones from './WaManagedPhones';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { setNotification } from 'common/notification';
import { syncWaGroupContactsQuery, syncWaGroupContactsQueryWithError, waManagedPhonesQuery } from 'mocks/Groups';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { GET_WA_MANAGED_PHONES } from 'graphql/queries/WaGroups';

const mock: any = [waManagedPhonesQuery];
const cache = new InMemoryCache();
cache.writeQuery({
  query: GET_WA_MANAGED_PHONES,
  variables: {
    filter: {},
  },
  data: {
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
});

const client = new ApolloClient({
  cache: cache,
  uri: 'http://localhost:4000/',
  assumeImmutableResults: true,
});

const setPhoneNumberMock = vi.fn();
const wrapper = (
  <MockedProvider mocks={mock}>
    <WaManagedPhones phonenumber={[]} setPhonenumber={setPhoneNumberMock} />
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

test('it should change the value', async () => {
  render(
    <ApolloProvider client={client}>
      <WaManagedPhones phonenumber={[]} setPhonenumber={setPhoneNumberMock} />
    </ApolloProvider>
  );
  const autoComplete = screen.getByTestId('AutocompleteInput');

  fireEvent.mouseDown(autoComplete);
  autoComplete.focus();
  fireEvent.keyDown(autoComplete, { key: 'ArrowDown' });
  fireEvent.keyDown(autoComplete, { key: 'ArrowDown' });
  fireEvent.keyDown(autoComplete, { key: 'Enter' });

  await waitFor(() => {
    expect(setPhoneNumberMock).toHaveBeenCalled();
  });
});

test('it should clear the value', async () => {
  const { getByTitle } = render(
    <ApolloProvider client={client}>
      <WaManagedPhones phonenumber={[]} setPhonenumber={setPhoneNumberMock} />
    </ApolloProvider>
  );
  const autoComplete = screen.getByTestId('AutocompleteInput');

  fireEvent.mouseDown(autoComplete);
  autoComplete.focus();
  fireEvent.keyDown(autoComplete, { key: 'ArrowDown' });
  fireEvent.keyDown(autoComplete, { key: 'ArrowDown' });
  fireEvent.keyDown(autoComplete, { key: 'Enter' });

  await waitFor(() => {
    expect(setPhoneNumberMock).toHaveBeenCalled();
  });

  fireEvent.click(getByTitle('Clear'));

  await waitFor(() => {
    expect(setPhoneNumberMock).toHaveBeenCalled();
  });
});

test('it should render the sync button correctly', async () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('syncGroups')).toBeInTheDocument();
});

test('it should render loading inside sync button on click', async () => {
  const { getByTestId } = render(
    <MockedProvider mocks={[...mock, syncWaGroupContactsQuery]}>
      <WaManagedPhones phonenumber={[]} setPhonenumber={vi.fn()} />
    </MockedProvider>
  );
  const syncButton = getByTestId('syncGroups');

  fireEvent.click(syncButton);

  await waitFor(() => {
    expect(getByTestId('loading')).toBeInTheDocument();
  });
});

test('it should sync groups contacts', async () => {
  const { getByTestId } = render(
    <MockedProvider mocks={[...mock, syncWaGroupContactsQuery]}>
      <WaManagedPhones phonenumber={[]} setPhonenumber={vi.fn()} />
    </MockedProvider>
  );
  const syncButton = getByTestId('syncGroups');

  fireEvent.click(syncButton);

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});

test('it shows error message', async () => {
  const { getByTestId } = render(
    <MockedProvider mocks={[...mock, syncWaGroupContactsQueryWithError]}>
      <WaManagedPhones phonenumber={[]} setPhonenumber={vi.fn()} />
    </MockedProvider>
  );
  const syncButton = getByTestId('syncGroups');
  fireEvent.click(syncButton);

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});

test('resolves the selected phone as the create dialog default', async () => {
  render(
    <ApolloProvider client={client}>
      <WaManagedPhones phonenumber={[{ id: '1', label: '7535988655' }]} setPhonenumber={vi.fn()} />
    </ApolloProvider>
  );

  // with a selected phone + populated data, defaultPhone runs
  // data.waManagedPhones.find(...) for the create dialog
  fireEvent.click(screen.getByTestId('createGroup'));
  expect(await screen.findByText('Create WhatsApp group')).toBeInTheDocument();
});

test('it opens and closes the create group dialog', async () => {
  render(
    <MockedProvider mocks={mock}>
      <WaManagedPhones phonenumber={[{ id: '1', label: '7535988655' }]} setPhonenumber={vi.fn()} />
    </MockedProvider>
  );

  fireEvent.click(screen.getByTestId('createGroup'));

  expect(await screen.findByText('Create WhatsApp group')).toBeInTheDocument();

  fireEvent.click(screen.getByTestId('cancel-button'));

  await waitFor(() => {
    expect(screen.queryByText('Create WhatsApp group')).not.toBeInTheDocument();
  });
});
