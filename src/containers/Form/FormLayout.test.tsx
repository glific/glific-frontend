import { render, waitFor, within, fireEvent } from '@testing-library/react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import { FlowList } from 'containers/Flow/FlowList/FlowList';
import { FormLayout } from './FormLayout';
import { LIST_ITEM_MOCKS, listItemProps } from './FormLayout.test.helper';

vi.mock('react-router-dom', () => {
  return {
    ...vi.requireActual('react-router-dom'),
    useParams: () => ({ id: 1 }),
  };
});
const mocks = LIST_ITEM_MOCKS;

const defaultProps = listItemProps;

const addItem = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <FormLayout {...defaultProps} />
    </Router>
  </MockedProvider>
);

it('should have a form', async () => {
  const { container } = render(addItem);
  await waitFor(() => {
    expect(container.querySelector('form')).toBeInTheDocument();
  });
});

it('should have a form with inputs', async () => {
  const { container } = render(addItem);
  await waitFor(() => {
    expect(container.querySelector('input[name="name"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="keywords"]')).toBeInTheDocument();
  });
});

const editItem = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <FormLayout {...defaultProps} />
    </Router>
  </MockedProvider>
);

test('inputs should have mock values', async () => {
  const { container } = render(editItem);

  await waitFor(() => {
    const nameField = container.querySelector('input[name="name"]') as HTMLInputElement;
    const keywordsField = container.querySelector('input[name="keywords"]') as HTMLInputElement;
    expect(nameField.getAttribute('value')).toBe('Help flow');
    expect(keywordsField.getAttribute('value')).toBe('help');
  });
});

test('cancel button should redirect to flowlist page', async () => {
  const { container, getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <Routes>
          <Route path="/" element={<FormLayout {...defaultProps} />} />
          <Route path="flow" element={<FlowList />} />
        </Routes>
      </Router>
    </MockedProvider>
  );
  await waitFor(() => {
    const { queryByText } = within(container.querySelector('form') as HTMLElement);
    const button = queryByText('Cancel') as HTMLButtonElement;
    fireEvent.click(button);
    expect(getByText('Loading...')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(getByText('Flows')).toBeInTheDocument();
  });
});
