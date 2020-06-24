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

afterEach(cleanup);
const mocks = [
  {
    request: {
      query: DELETE_TAG,
      variables: {
        id: '87',
      },
    },
    result: {
      data: {
        deleteTag: {
          errors: null,
        },
      },
    },
  },
  {
    request: {
      query: GET_LANGUAGES,
    },
    result: {
      data: {
        languages: [
          {
            id: '1',
            label: 'English (United States)',
          },
          {
            id: '2',
            label: 'Hindi (India)',
          },
        ],
      },
    },
  },
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
            id: '87',
            label: 'Good message',
            description: 'Hey There',
          },
          {
            id: '94',
            label: 'Message',
            description: 'some description',
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

  it('should have add new button', async () => {
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

  test('taglist has proper headers', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <TagList />
        </Router>
      </MockedProvider>
    );

    await wait();
    const { getByText } = within(container.querySelector('thead'));
    expect(getByText('Name')).toBeInTheDocument();
    expect(getByText('Description')).toBeInTheDocument();
    expect(getByText('Actions')).toBeInTheDocument();
  });

  test('A row in the table should have an edit and delete button', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <TagList />
        </Router>
      </MockedProvider>
    );
    await wait();
    const { getByLabelText } = within(container.querySelector('tbody tr'));
    expect(getByLabelText('Edit')).toBeInTheDocument();
    expect(getByLabelText('Delete')).toBeInTheDocument();
  });

  test('add new Button contains a route to add new page', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Switch>
            <Route path="/tag/add" exact component={Tag} />
          </Switch>
          <TagList />
        </Router>
      </MockedProvider>
    );
    await wait();
    const button = container.querySelector('button.MuiButton-containedPrimary');
    fireEvent.click(button);
    await wait();
    expect(container.querySelector('div.TagAdd')).toBeInTheDocument();
  });

  test('edit Button contains a route to edit page', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Switch>
            <Route path="/tag/add" exact component={Tag} />
          </Switch>
          <TagList />
        </Router>
      </MockedProvider>
    );
    await wait();
    expect(container.querySelector('tbody tr a').getAttribute('href')).toBe('/tag/87/edit');
  });
});

describe('<Dialogbox />', () => {
  test('click on delete button opens dialog box', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <TagList />
        </Router>
      </MockedProvider>
    );
    await wait();
    const { queryByLabelText } = within(container.querySelector('tbody tr'));
    const button = queryByLabelText('Delete');
    fireEvent.click(button);
    await wait();
    expect(screen.queryByRole('dialog')).toBeInTheDocument();
  });

  test('click on agree button shows alert', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <TagList />
        </Router>
      </MockedProvider>
    );
    await wait();
    const { queryByLabelText } = within(container.querySelector('tbody tr'));
    const button = queryByLabelText('Delete');
    fireEvent.click(button);
    await wait();
    const agreeButton = screen
      .queryByRole('dialog')
      ?.querySelector('button.MuiButton-containedSecondary');
    fireEvent.click(agreeButton);
    await wait();
    expect(screen.queryByRole('alert')).toBeInTheDocument();
  });
});
