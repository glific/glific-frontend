import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CollectionInformation } from './CollectionInformation';
import { MockedProvider } from '@apollo/client/testing';
import { getCollectionInfo, getCollectionUsersQuery } from '../../../mocks/Collection';
import { GET_COLLECTION_USERS } from '../../../graphql/queries/Collection';

const wrapper = (
  <MockedProvider mocks={[getCollectionInfo, getCollectionUsersQuery]} addTypename={false}>
    <CollectionInformation collectionId={'1'} />
  </MockedProvider>
);

const collectionUsersQuery = {
  request: {
    query: GET_COLLECTION_USERS,
    variables: { id: '1' },
  },
  result: {
    data: {
      group: {
        group: {
          users: [
            {
              id: '1',
              name: 'John Doe',
            },
            {
              id: '2',
              name: 'Jane Doe',
            },
            {
              id: '3',
              name: 'Staff User',
            },
          ],
        },
      },
    },
  },
};

describe('<CollectionInformation />', () => {
  test('it should mount', async () => {
    render(wrapper);
    await waitFor(() => {});
    const collectionInformation = screen.getByTestId('CollectionInformation');

    expect(collectionInformation).toBeInTheDocument();
  });
});

describe('render SessionInfo', () => {
  test('it should have session data', async () => {
    const { getByText } = render(wrapper);
    await waitFor(() => {});
    const SessionInfo = getByText('Session messages:');

    expect(SessionInfo).toBeInTheDocument();
  });

  test('it should have 2 staff', async () => {
    const { getAllByText } = render(wrapper);

    await waitFor(() => {
      const SessionInfo = getAllByText('1');

      expect(SessionInfo);
    });
  });

  test('it should have 3 staff', async () => {
    const { getAllByText } = render(
      <MockedProvider mocks={[getCollectionInfo, collectionUsersQuery]} addTypename={false}>
        <CollectionInformation collectionId={'1'} />
      </MockedProvider>
    );

    await waitFor(() => {
      const SessionInfo = getAllByText('1');

      expect(SessionInfo);
    });
  });
});

describe('render collection info popup', () => {
  const wrapper = (
    <MockedProvider mocks={[getCollectionInfo, collectionUsersQuery]} addTypename={false}>
      <CollectionInformation
        collectionId={'1'}
        displayPopup
        setDisplayPopup={() => Function}
        handleSendMessage={() => Function}
      />
    </MockedProvider>
  );
  test('it should display popup', async () => {
    const { getAllByText } = render(wrapper);

    await waitFor(() => {
      const SessionInfo = getAllByText('1');

      expect(SessionInfo);
    });
  });

  test('click on ok', async () => {
    const { findByTestId } = render(wrapper);

    await waitFor(async () => {
      const Ok = findByTestId('ok-button');

      fireEvent.click(await Ok);
    });
  });

  test('click on cancel', async () => {
    const { findByTestId } = render(wrapper);

    await waitFor(async () => {
      const cancel = findByTestId('cancel-button');

      fireEvent.click(await cancel);
    });
  });
});
