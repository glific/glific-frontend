import React from 'react';
import { render, wait, screen, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Tag } from '../Tag/Tag';
import { List } from './List';

import { Switch, Route } from 'react-router-dom';
import { within, fireEvent } from '@testing-library/dom';
import { LIST_MOCKS, defaultProps } from './List.test.helper';

const mocks = LIST_MOCKS;

const list = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <List {...defaultProps} />
    </Router>
  </MockedProvider>
);

it('should have loading', async () => {
  const { getByText } = render(list);
  expect(getByText('Loading...')).toBeInTheDocument();
  await wait();
});

it('should have add new button', async () => {
  const { container } = render(list);

  await wait();
  expect(container.querySelector('button.MuiButton-containedPrimary')).toBeInTheDocument();
});

it('should have a table', async () => {
  const { container } = render(list);

  await wait();
  expect(container.querySelector('table')).toBeInTheDocument();
});

test('list has proper headers', async () => {
  const { container } = render(list);
  await wait();
  const tableHead = container.querySelector('thead');
  const { getByText } = within(tableHead);
  expect(getByText('label')).toBeInTheDocument();
  expect(getByText('description')).toBeInTheDocument();
  expect(getByText('keywords')).toBeInTheDocument();
  expect(getByText('actions')).toBeInTheDocument();
});

test('A row in the table should have an edit and delete button', async () => {
  const { container } = render(list);

  await wait();
  const tableRow = container.querySelector('tbody tr');
  const { getByLabelText } = within(tableRow);
  expect(getByLabelText('Edit')).toBeInTheDocument();
  expect(getByLabelText('Delete')).toBeInTheDocument();
});

const listButtons = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Switch>
        <Route path="/tag/add" exact component={Tag} />
      </Switch>
      <List {...defaultProps} />
    </Router>
  </MockedProvider>
);

test('click on delete button opens dialog box', async () => {
  const { container } = render(list);

  await wait();
  const { queryByLabelText } = within(container.querySelector('tbody tr'));
  const button = queryByLabelText('Delete');
  fireEvent.click(button);
  await wait();
  expect(screen.queryByRole('dialog')).toBeInTheDocument();
});

test('click on agree button shows alert', async () => {
  const { getAllByTestId } = render(list);

  await wait();
  const button = getAllByTestId('DeleteIcon')[0];
  fireEvent.click(button);
  await wait();
  const agreeButton = screen
    .queryByRole('dialog')
    ?.querySelector('button.MuiButton-containedSecondary');
  fireEvent.click(agreeButton);
  await wait();
  expect(screen.queryByRole('alert')).toBeInTheDocument();
});
