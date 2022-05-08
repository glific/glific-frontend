import { render, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

import { LIST_ITEM_MOCKS } from 'containers/Form/FormLayout.test.helper';
import { Tag } from './Tag';

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

  fireEvent.change(container.querySelector('input[name="label"]') as HTMLInputElement, {
    target: { value: 'new Tag' },
  });

  fireEvent.change(container.querySelector('textarea[name="description"]') as HTMLTextAreaElement, {
    target: { innerHTML: 'new Tag description' },
  });

  fireEvent.change(container.querySelector('input[name="languageId"]') as HTMLInputElement, {
    target: { value: 1 },
  });

  const button = getByText('Save');
  fireEvent.click(button);

  //need to have an assertion here
  await waitFor(() => {});
});
