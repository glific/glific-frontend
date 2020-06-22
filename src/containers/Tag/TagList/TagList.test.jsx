import React from 'react';
import { render, wait } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { GET_TAGS_COUNT, FILTER_TAGS } from '../../../graphql/queries/Tag';
import { TagList } from './TagList';
import { within } from '@testing-library/dom';

const mocks = [
  {
    request: {
      query: GET_TAGS_COUNT,

      variables: {
        filter: {
          label: '',
        },
      },
    },
    result: {
      data: {
        countTags: 2,
      },
    },
  },
  {
    request: {
      query: FILTER_TAGS,

      variables: {
        filter: {
          label: '',
        },
        opts: {
          limit: 10,
          offset: 0,
          order: 'ASC',
        },
      },
    },
    result: {
      data: {
        tags: [
          {
            description: 'Hey There',
            id: '87',
            label: 'Message',
          },
          {
            description: 'something',
            id: '94',
            label: 'Good message',
          },
        ],
      },
    },
  },
];

describe('<TagList />', () => {
  it('should have loading', async () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <TagList />
        </Router>
      </MockedProvider>
    );

    expect(getByText('Loading...')).toBeInTheDocument();

    await wait();
  });

  it('should have a button', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <TagList />
        </Router>
      </MockedProvider>
    );

    await wait();

    expect(container.querySelector('button.MuiButton-containedPrimary')).toBeInTheDocument();
  });

  it('should have a button with text ', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <TagList />
        </Router>
      </MockedProvider>
    );

    await wait();

    expect(container.querySelector('button.MuiButton-containedPrimary')).toHaveTextContent(
      'Add New'
    );
  });

  it('should have a table', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <TagList />
        </Router>
      </MockedProvider>
    );

    await wait();

    expect(container.querySelector('table')).toBeInTheDocument();
  });

  it('should have a table with the header contents Name, Description and action', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <TagList />
        </Router>
      </MockedProvider>
    );

    await wait();

    const { getByText } = within(container.querySelector('table'));

    expect(getByText('Name')).toBeInTheDocument();
    expect(getByText('Description')).toBeInTheDocument();
    expect(getByText('Actions')).toBeInTheDocument();
  });
});
