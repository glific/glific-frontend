import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import GroupDetails from './GroupDetails';
import {
  countWaGroupContacts,
  removeContactQuery,
  searchFilterQuery,
  waGroupContacts,
} from 'mocks/Groups';
import { setNotification } from 'common/notification';

const mocks = [
  waGroupContacts,
  countWaGroupContacts,
  waGroupContacts,
  countWaGroupContacts,
  removeContactQuery,
  waGroupContacts,
  countWaGroupContacts,
  searchFilterQuery,
];

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn((...args) => {
      return args[1];
    }),
  };
});

vi.mock('react-router-dom', async () => {
  return {
    ...(await vi.importActual<any>('react-router-dom')),
    useParams: () => ({ id: '1' }),
  };
});

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <GroupDetails />
    </MemoryRouter>
  </MockedProvider>
);

test('should render Group details', async () => {
  const { getByTestId, getAllByTestId } = render(wrapper);

  expect(getByTestId('loader')).toBeInTheDocument();

  await waitFor(() => {
    expect(getAllByTestId('contact-name')[0]).toHaveTextContent('User 1');
    expect(getAllByTestId('phone-number')[0]).toHaveTextContent('918416933261');
  });
});

test('should render admin tag for admins', async () => {
  const { getByTestId, getByText } = render(wrapper);

  expect(getByTestId('loader')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Admin')).toBeInTheDocument();
  });
});

test('should render Maytapi Numer for maytapi managed numbers', async () => {
  const { getByTestId, getAllByTestId } = render(wrapper);

  expect(getByTestId('loader')).toBeInTheDocument();

  await waitFor(() => {
    expect(getAllByTestId('contact-name')[1]).toHaveTextContent('Maytapi Number');
  });
});

test('if number of groups exceed 4 it should show + n groups ', async () => {
  const { getByTestId, getAllByTestId } = render(wrapper);

  expect(getByTestId('loader')).toBeInTheDocument();

  await waitFor(() => {
    expect(getAllByTestId('contact-name')[0]).toHaveTextContent('User 1');

    // when number of groups is more than 4
    expect(getAllByTestId('contact-groups')[0]).toHaveTextContent(
      'Group 1, Group 2, Group 3, Group 4 + 26 groups'
    );

    // when number of groups is less than 4
    expect(getAllByTestId('contact-groups')[1]).toHaveTextContent('Maytapi Testing, Random2');
  });
});

test('should remove contact', async () => {
  const { getByTestId, getAllByTestId } = render(wrapper);

  expect(getByTestId('loader')).toBeInTheDocument();

  await waitFor(() => {
    expect(getAllByTestId('contact-name')[0]).toHaveTextContent('User 1');
  });

  fireEvent.click(getAllByTestId('removeContact')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(setNotification).toHaveBeenCalled();
  });
});

test('should close dialog box', async () => {
  const { getByTestId, getAllByTestId } = render(wrapper);

  expect(getByTestId('loader')).toBeInTheDocument();

  await waitFor(() => {
    expect(getAllByTestId('contact-name')[0]).toHaveTextContent('User 1');
  });

  fireEvent.click(getAllByTestId('removeContact')[0]);

  const dialogBox = screen.getByTestId('dialogBox');

  await waitFor(() => {
    expect(dialogBox).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('cancel-button'));

  await waitFor(() => {
    expect(dialogBox).not.toBeInTheDocument();
  });
});
