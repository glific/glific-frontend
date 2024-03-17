import { MockedProvider } from '@apollo/client/testing';
import WaManagedPhones from './WaManagedPhones';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { setNotification } from 'common/notification';
import {
  syncWaGroupContactsQuery,
  syncWaGroupContactsQueryWithError,
  waManagedPhonesQuery,
} from 'mocks/Groups';

const mock: any = [waManagedPhonesQuery];

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
