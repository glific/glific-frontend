import React from 'react';
import { render, wait, screen, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { GET_TAGS_COUNT, FILTER_TAGS, GET_LANGUAGES } from '../../../graphql/queries/Tag';
import { TagList } from './TagList';
import { DELETE_TAG } from '../../../graphql/mutations/Tag';
import { Switch, Route } from 'react-router-dom';
import { within, fireEvent } from '@testing-library/dom';
import { Tag } from '../Tag';
import { LIST_MOCKS } from '../../List/List.test.helper';

const mocks = LIST_MOCKS;

const tagList = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <TagList />
    </Router>
  </MockedProvider>
);

const TagListButtons = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Switch>
        <Route path="/tag/add" exact component={Tag} />
      </Switch>
      <TagList />
    </Router>
  </MockedProvider>
);

test('edit button for a tag should redirect to edit tag page', async () => {
  const { container } = render(TagListButtons);
  await wait();
  expect(container.querySelector('tbody tr a').getAttribute('href')).toBe('/tag/87/edit');
});
