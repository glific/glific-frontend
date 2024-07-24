import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import { Search } from './Search';
import { LIST_ITEM_MOCKS } from './Search.test.helper';

const defaultProps = (type = 'search') => ({
  type,
  search: vi.fn(),
  handleCancel: vi.fn(),
  handleSave: vi.fn(),
  searchParam: {
    term: 'hi',
    label: '',
    shortcode: '',
  },
  setState: vi.fn(),
  searchId: '1',
});

const mocks = LIST_ITEM_MOCKS;

test('should load the search edit', async () => {
  const inclusive: any = {
    includeTags: [{ id: '1', label: 'Messages' }],
    includeGroups: [
      {
        id: '1',
        isRestricted: false,
        label: 'Group 1',
      },
    ],
    includeUsers: [{ id: '1', name: 'Glific Admin' }],
    includeLabels: [
      {
        id: '1',
        name: 'Label 1',
      },
    ],
    dateFrom: new Date(),
    dateTo: new Date(),
    shortcode: 'search',
    label: 'search',
  };

  const props: any = defaultProps();
  props.searchParam = { ...props.searchParam, ...inclusive };

  const wrapper = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <Search {...props} />
      </Router>
    </MockedProvider>
  );

  const { getByText, getByTestId, container } = render(wrapper);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    const formLayout = getByTestId('formLayout');
    expect(formLayout).toHaveTextContent('Search');
  });

  await waitFor(() => {
    const search = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(search);
  });
});

test('it renders component with saveSearch params', async () => {
  const wrapper = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <Search {...defaultProps('saveSearch')} />
      </Router>
    </MockedProvider>
  );

  const { getByText, getByTestId } = render(wrapper);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    const formLayout = getByTestId('formLayout');
    expect(formLayout).toHaveTextContent('Title');
  });

  const [shortcode, label] = screen.getAllByRole('textbox');

  fireEvent.change(shortcode, { target: { value: 'test' } });
  fireEvent.change(label, { target: { value: 'test' } });
});
