import React from 'react';
import { render, wait, within, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Tag } from './Tag';
import { Route } from 'react-router-dom';
import { TagList } from './TagList/TagList';
import { LIST_ITEM_MOCKS } from '../List/ListItem/ListItem.test.helper';

const mocks = LIST_ITEM_MOCKS;

test('cancel button should redirect to taglist page', async () => {
  const { container, getByText, unmount } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <Tag match={{ params: { id: 1 } }} />
        <Route path="/tag" exact component={TagList} />
      </Router>
    </MockedProvider>
  );
  await wait();
  const { queryByText } = within(container.querySelector('form'));
  const button = queryByText('Cancel');

  fireEvent.click(button);
  expect(getByText('Loading...')).toBeInTheDocument();
  await wait();
  expect(getByText('Tags')).toBeInTheDocument();
  unmount();
});

test('save button should add a new tag', async () => {
  const { container, getByText, getAllByTestId } = render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Router>
        <Tag match={{ params: { id: null } }} />
        <Route path="/tag" exact component={TagList} />
      </Router>
    </MockedProvider>
  );

  await wait();

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
  await wait(() => expect(getByText('Important')).toBeInTheDocument());
});
