import { render } from '@testing-library/react';

import { CollectionDescription } from './CollectionDescription';

const defaultProps = {
  users: [{ id: 1, name: 'Default User' }],
  description: 'Default collection',
};

const wrapper = <CollectionDescription {...defaultProps}></CollectionDescription>;

it('should render CollectionDescription', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('collectionDescription')).toBeInTheDocument();
});
