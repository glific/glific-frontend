import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { Tag } from './Tag';
import { LIST_ITEM_MOCKS } from '../Form/FormLayout.test.helper';

jest.mock('axios');
const mocks = LIST_ITEM_MOCKS;

const wrapper = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Tag match={{ params: { id: 1 } }} />
  </MockedProvider>
);

test('should load tag edit form', async () => {
  const { getByText, getByTestId } = render(wrapper);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    const formLayout = getByTestId('formLayout');
    expect(formLayout).toHaveTextContent('Keywords');
  });
});

test('should be able to submit the data on save', async () => {
  const { container, getByText, getByTestId } = render(wrapper);

  // loading is show initially
  expect(getByText('Loading...')).toBeInTheDocument();
  await waitFor(() => {
    const formLayout = getByTestId('formLayout');
    expect(formLayout).toHaveTextContent('Keywords');
  });

  fireEvent.change(container.querySelector('input[name="label"]'), {
    target: { value: 'new Tag' },
  });

  fireEvent.change(container.querySelector('textarea[name="description"]'), {
    target: { innerHTML: 'new Tag description' },
  });

  fireEvent.change(container.querySelector('input[name="languageId"]'), {
    target: { value: 1 },
  });

  const button = getByText('Save');
  fireEvent.click(button);

  //need to have an assertion here
  await waitFor(() => {});
});
