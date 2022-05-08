import { render, waitFor, within, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Route } from 'react-router-dom';

import { setUserSession } from 'services/AuthService';
import { TagList } from 'containers/Tag/TagList/TagList';
import { FormLayout } from './FormLayout';
import { LIST_ITEM_MOCKS, listItemProps } from './FormLayout.test.helper';

const mocks = LIST_ITEM_MOCKS;

const defaultProps = listItemProps;

const addItem = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <FormLayout match={{ params: { id: null } }} {...defaultProps} />
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

const editItem = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <FormLayout match={{ params: { id: 1 } }} {...defaultProps} />
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

const editItemRoute = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <FormLayout match={{ params: { id: 1 } }} {...defaultProps} />
      <Route path="/tag" exact component={TagList} />
    </Router>
  </MockedProvider>
);

test('cancel button should redirect to taglist page', async () => {
  const { container, getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <FormLayout match={{ params: { id: 1 } }} {...defaultProps} />
        <Route path="/tag" exact component={TagList} />
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

test('save button should add a new tag', async () => {
  const { container, getByText, getAllByTestId } = render(editItemRoute);

  setUserSession(JSON.stringify({ roles: ['Admin'] }));

  await waitFor(() => {
    const button = getByText('Save');
    fireEvent.click(button);
  });

  await waitFor(() => {
    expect(getByText('Important')).toBeInTheDocument();
  });
});
