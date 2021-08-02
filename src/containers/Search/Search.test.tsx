import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { Search } from './Search';
import { LIST_ITEM_MOCKS } from './Search.test.helper';

const defaultProps = (type = 'search') => ({
  match: { params: { id: 1 } },
  type,
  search: jest.fn(),
  handleCancel: jest.fn(),
  handleSave: jest.fn(),
  searchParam: {
    term: 'hi',
  },
  setState: jest.fn(),
});

const mocks = LIST_ITEM_MOCKS;

test('should load the search edit', async () => {
  const wrapper = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <Search {...defaultProps()} />
    </MockedProvider>
  );

  const { getByText, findByTestId } = render(wrapper);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  const formLayout = await findByTestId('formLayout');
  expect(formLayout).toHaveTextContent('Search');
});
