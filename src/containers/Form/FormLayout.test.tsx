import { render, waitFor, within, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Route, Routes } from 'react-router-dom';

import { setUserSession } from 'services/AuthService';
import { TagList } from 'containers/Tag/TagList/TagList';
import { FormLayout } from './FormLayout';
import { LIST_ITEM_MOCKS, listItemProps } from './FormLayout.test.helper';

jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual('react-router-dom'),

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
    expect(container.querySelector('input[name="label"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="languageId"]')).toBeInTheDocument();
  });
});

test('save button should add a new tag', async () => {
  const editItemRoute = (
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <Routes>
          <Route path="/" element={<FormLayout {...defaultProps} />} />
          <Route path="tag" element={<TagList />} />
        </Routes>
      </Router>
    </MockedProvider>
  );

  const { container, getByText, getAllByTestId } = render(editItemRoute);

  setUserSession(JSON.stringify({ roles: ['Admin'] }));

  await waitFor(() => {
    const button = getByText('Save');
    fireEvent.click(button);
  });

  await waitFor(() => {
    expect(container?.querySelector('input[name="label"]')).toHaveValue('important');
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
  const { container, unmount } = render(editItem);

  await waitFor(() => {
    const labelField = container.querySelector('input[name="label"]') as HTMLInputElement;
    const languageField = container.querySelector('input[name="languageId"]') as HTMLInputElement;
    expect(labelField?.value).toBe('important');
    expect(languageField.getAttribute('value')).toBe('1');
  });
});

test('cancel button should redirect to taglist page', async () => {
  const { container, getByText, unmount } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <Routes>
          <Route path="/" element={<FormLayout {...defaultProps} />} />
          <Route path="tag" element={<TagList />} />
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
    expect(getByText('Tags')).toBeInTheDocument();
  });
});
