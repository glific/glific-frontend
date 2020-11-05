import React from 'react';
import { render, wait, within, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { FormLayout } from './FormLayout';
import { Route } from 'react-router-dom';
import { TagList } from '../Tag/TagList/TagList';
import { LIST_ITEM_MOCKS, listItemProps } from './FormLayout.test.helper';
import { setUserSession } from '../../services/AuthService';

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
  await wait();
  expect(container.querySelector('form')).toBeInTheDocument();
});

it('should have a form with inputs', async () => {
  const { container } = render(addItem);
  await wait();
  expect(container.querySelector('input[name="label"]')).toBeInTheDocument();
  expect(container.querySelector('input[name="languageId"]')).toBeInTheDocument();
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

  await wait();
  expect(container.querySelector('input[name="label"]')?.value).toBe('important');
  expect(container.querySelector('input[name="languageId"]').getAttribute('value')).toBe('1');
});

test('cancel button should redirect to taglist page', async () => {
  const { container, getByText } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <FormLayout match={{ params: { id: 1 } }} {...defaultProps} />
        <Route path="/tag" exact component={TagList} />
      </Router>
    </MockedProvider>
  );
  await wait();
  await wait();
  const { queryByText } = within(container.querySelector('form'));
  const button = queryByText('Cancel');

  fireEvent.click(button);
  expect(getByText('Loading...')).toBeInTheDocument();
  await wait();
  expect(getByText('Tags')).toBeInTheDocument();
});

test('save button should add a new tag', async () => {
  const { container, getByText, getAllByTestId } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <FormLayout match={{ params: { id: 1 } }} {...defaultProps} />
        <Route path="/tag" exact component={TagList} />
      </Router>
    </MockedProvider>
  );

  setUserSession(JSON.stringify({ roles: ['Admin'] }));

  await wait();

  const button = getByText('Save');
  fireEvent.click(button);
  await wait();
  await wait();
  expect(getByText('Important')).toBeInTheDocument();
});
