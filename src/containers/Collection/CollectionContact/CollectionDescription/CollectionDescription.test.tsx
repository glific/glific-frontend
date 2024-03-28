import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import { getCollectionInfo, getCollectionUsersQuery } from 'mocks/Collection';

import { CollectionDescription } from './CollectionDescription';

const defaultProps = {
  users: [{ id: 1, name: 'Default User' }],
  description: 'Default collection',
};

const mocks = [getCollectionInfo({ id: '1' }), getCollectionUsersQuery];

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <CollectionDescription {...defaultProps}></CollectionDescription>
  </MockedProvider>
);

it('should render CollectionDescription', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('collectionDescription')).toBeInTheDocument();
});
