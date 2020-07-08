import React from 'react';
import { render, wait, within, fireEvent, cleanup, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { GET_LANGUAGES, GET_TAG, GET_TAGS_COUNT, FILTER_TAGS } from '../../graphql/queries/Tag';
import { CREATE_TAG } from '../../graphql/mutations/Tag';
import { Tag } from './Tag';
import { Switch, Route } from 'react-router-dom';
import { TagList } from './TagList/TagList';

afterEach(cleanup);
const mocks = [
  {
    request: {
      query: CREATE_TAG,
      variables: {
        input: {
          description: 'new Tag description',
          keywords: '',
          label: 'new Tag',
          languageId: 1,
        },
      },
    },
    result: {
      data: {
        createTag: {
          tag: {
            description: 'new Tag description',
            id: '121',
            keywords: [],
            label: 'new Tag',
            language: {
              id: '1',
            },
          },
        },
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
            label: 'Important',
            description: 'important task',
          },
          {
            id: '94',
            label: 'To Do',
            description: 'complete this task',
          },
        ],
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
      query: GET_TAG,
      variables: {
        id: 1,
      },
    },
    result: {
      data: {
        tag: {
          tag: {
            id: 1,
            label: 'important',
            description: 'important label',
            keywords: ['hi'],
            language: {
              id: 1,
            },
          },
        },
      },
    },
  },
];

describe('<Tag />', () => {
  it('should have a form', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Tag match={{ params: { id: null } }} />
        </Router>
      </MockedProvider>
    );
    await wait();
    expect(container.querySelector('form')).toBeInTheDocument();
  });

  it('should have a form with inputs', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Tag match={{ params: { id: null } }} />
        </Router>
      </MockedProvider>
    );
    await wait();
    expect(container.querySelector('textarea[name="label"]')).toBeInTheDocument();
    expect(container.querySelector('textarea[name="description"]')).toBeInTheDocument();
    expect(container.querySelector('textarea[name="keywords"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="languageId"]')).toBeInTheDocument();
  });

  test('inputs should have mock values', async () => {
    const { container, unmount } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Tag match={{ params: { id: 1 } }} />
        </Router>
      </MockedProvider>
    );

    await wait();
    expect(container.querySelector('textarea[name="label"]')?.textContent).toBe('important');
    expect(container.querySelector('textarea[name="description"]')?.textContent).toBe(
      'important label'
    );
    expect(container.querySelector('input[name="languageId"]').getAttribute('value')).toBe('1');
  });

  test('cancel button should redirect to taglist page', async () => {
    const { container, getByText, unmount } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Tag match={{ params: { id: 1 } }} />
          <Switch>
            <Route path="/tag" exact component={TagList} />
          </Switch>
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
});

describe('Save Button', () => {
  test('save button should add a new tag', async () => {
    const { container, getByText, getAllByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Switch>
            <Route path="/tag" exact component={TagList} />
          </Switch>
          <Tag match={{ params: { id: null } }} />
        </Router>
      </MockedProvider>
    );

    await wait();

    fireEvent.change(container.querySelector('textarea[name="label"]'), {
      target: { innerHTML: 'new Tag' },
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
});
