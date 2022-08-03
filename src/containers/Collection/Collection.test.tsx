import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';

import { getCollectionQuery, getCollectionsQuery, getCollectionUsersQuery } from 'mocks/Collection';
import { getUsersQuery } from 'mocks/User';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from 'mocks/Organization';
import * as FormLayout from 'containers/Form/FormLayout';
import { Collection } from './Collection';

const mocks = [
  getUsersQuery,
  ...getOrganizationQuery,
  getCollectionQuery,
  getOrganizationLanguagesQuery,
  getOrganizationLanguagesQuery,
  getCollectionQuery, // if you refetch then you need to include same mock twice
  getCollectionUsersQuery,
  getCollectionUsersQuery,
  ...getCollectionsQuery,
];

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Collection match={{ params: { id: '1' } }} />
  </MockedProvider>
);

describe('<Collection />', () => {
  test('should render Collection and hit save', async () => {
    const { getByText, getAllByTestId } = render(wrapper);

    // loading is show initially
    expect(getByText('Loading...')).toBeInTheDocument();

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
    const saveButton = screen.getByText('Save');
    await waitFor(() => {
      UserEvent.click(saveButton);
    });
  });

  test('it should call additional query and hit the update users function', async () => {
    const mockCallback = jest.fn();
    const spy = jest.spyOn(FormLayout, 'FormLayout');
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
    fireEvent.click(getByTestId('collection'));

    await waitFor(() => {
      expect(mockCallback).toBeCalled();
    });
  });
});
