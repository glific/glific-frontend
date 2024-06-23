import 'mocks/matchMediaMock';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';
import {
  createCollectionQuery,
  getCollectionQuery,
  getCollectionsQuery,
  getCollectionUsersQuery,
} from 'mocks/Collection';
import { getUsersQuery } from 'mocks/User';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from 'mocks/Organization';
import { Collection } from './Collection';
import * as FormLayout from 'containers/Form/FormLayout';
import { getRoleNamesMock } from 'containers/StaffManagement/StaffManagement.test.helper';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { getSearchCollectionQuery } from 'mocks/Search';

const mocks = [
  getRoleNamesMock,
  getUsersQuery,
  ...getOrganizationQuery,
  getCollectionQuery,
  getOrganizationLanguagesQuery,
  getOrganizationLanguagesQuery,
  getCollectionQuery, // if you refetch then you need to include same mock twice
  getCollectionUsersQuery,
  getCollectionUsersQuery,
  ...getCollectionsQuery,
  createCollectionQuery,
  getSearchCollectionQuery,
];

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <BrowserRouter>
      <Collection />
    </BrowserRouter>
  </MockedProvider>
);

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn((...args) => {
      return args[1];
    }),
  };
});

const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUsedNavigate,
}));

describe('collection', () => {
  beforeEach(() => {
    cleanup();
  });

  test('should render Collection and hit save', async () => {
    const { getByText, getAllByTestId, getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/collection/1/edit']}>
          <Routes>
            <Route path="collection/:id/edit" element={<Collection />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    // loading is show initially
    expect(getByTestId('loader')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Edit collection')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getByText('John Doe')).toBeInTheDocument();
    });

    // remove first user
    const removeUser = getAllByTestId('deleteIcon');
    UserEvent.click(removeUser[0]);
    // click on SAVE
    const saveButton = getByTestId('submitActionButton');
    await waitFor(() => {
      UserEvent.click(saveButton);
    });
  });

  test('should render add Collection ', async () => {
    const { getByText } = render(wrapper);

    await waitFor(() => {
      expect(getByText('Add a new collection')).toBeInTheDocument();
    });
  });

  test('should be able to create a collection', async () => {
    const { getByText, getAllByRole, getByTestId } = render(wrapper);

    expect(getByTestId('loader')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Title')).toBeInTheDocument();
    });

    const collectionInputs = getAllByRole('textbox');

    fireEvent.change(collectionInputs[0], { target: { value: 'Sample Collection Title' } });
    fireEvent.change(collectionInputs[1], { target: { value: 'Sample Collection Description' } });

    fireEvent.click(getByText('Save'));
  });

  test('should be able to check for existing collections', async () => {
    const { getByText, getAllByRole, getByTestId } = render(wrapper);

    expect(getByTestId('loader')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Title')).toBeInTheDocument();
    });

    const collectionInputs = getAllByRole('textbox');

    fireEvent.change(collectionInputs[0], { target: { value: 'Staff group' } });
    fireEvent.click(collectionInputs[1]);

    fireEvent.click(getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Title already exists.')).toBeInTheDocument();
    });
  });

  test('it should call additional query and hit the update users function', async () => {
    const mockCallback = vi.fn();
    const spy = vi.spyOn(FormLayout, 'FormLayout');
    spy.mockImplementation((props: any) => {
      const { additionalQuery } = props;
      return (
        <div
          onClick={() => {
            additionalQuery(['1']);
            mockCallback();
          }}
          data-testid="collection"
        >
          <span>Edit collection</span>
        </div>
      );
    });

    const { getByTestId } = render(wrapper);
    expect(getByTestId('loader')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByTestId('collection')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('collection'));

    await waitFor(() => {
      expect(mockCallback).toBeCalled();
    });
  });
});
