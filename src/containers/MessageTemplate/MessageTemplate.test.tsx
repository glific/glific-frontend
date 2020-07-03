import React from 'react';
import { render, wait, within, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { GET_LANGUAGES } from '../../graphql/queries/Tag';
import {
  GET_TEMPLATE,
  GET_TEMPLATES_COUNT,
  FILTER_TEMPLATES,
} from '../../graphql/queries/Template';
import { CREATE_TEMPLATE } from '../../graphql/mutations/Template';
import { MessageTemplate } from './MessageTemplate';
import { Switch, Route } from 'react-router-dom';
import { MessageTemplateList } from './MessageTemplateList/MessageTemplateList';

afterEach(cleanup);
const mocks = [
  {
    request: {
      query: CREATE_TEMPLATE,
      variables: {
        input: {
          body: 'new Template body',
          isActive: true,
          label: 'new Template',
          languageId: 1,
          type: 'TEXT',
        },
      },
    },
    result: {
      data: {
        creatcreateSessionTemplateeTag: {
          sessionTemplate: {
            body: 'new Template body',
            id: '121',
            label: 'new Template',
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_TEMPLATES_COUNT,
      variables: {
        filter: {
          label: '',
        },
      },
    },
    result: {
      data: {
        countSessionTemplates: 2,
      },
    },
  },
  {
    request: {
      query: FILTER_TEMPLATES,
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
        sessionTemplates: [
          {
            id: '87',
            label: 'Good message',
            body: 'Hey There',
          },
          {
            id: '94',
            label: 'Message',
            body: 'some description',
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
      query: GET_TEMPLATE,
      variables: {
        id: 1,
      },
    },
    result: {
      data: {
        sessionTemplate: {
          sessionTemplate: {
            id: 1,
            label: 'important',
            body: 'important template',
            isActive: true,
            language: {
              id: 1,
            },
          },
        },
      },
    },
  },
];

describe('<MessageTemplate />', () => {
  it('should have a form', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <MessageTemplate match={{ params: { id: null } }} />
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
          <MessageTemplate match={{ params: { id: null } }} />
        </Router>
      </MockedProvider>
    );
    await wait();
    expect(container.querySelector('input[name="label"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="body"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="isActive"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="languageId"]')).toBeInTheDocument();
  });

  test('inputs should have mock values', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <MessageTemplate match={{ params: { id: 1 } }} />
        </Router>
      </MockedProvider>
    );

    await wait();
    expect(container.querySelector('input[name="label"]').getAttribute('value')).toBe('important');
    expect(container.querySelector('input[name="body"]').getAttribute('value')).toBe(
      'important template'
    );
    expect(container.querySelector('input[name="isActive"]').getAttribute('value')).toBe('true');
    expect(container.querySelector('input[name="languageId"]').getAttribute('value')).toBe('1');
  });

  test('cancel button should redirect to MessageTemplatelist page', async () => {
    const { container, getByText, unmount } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Switch>
            <Route path="/speed-send" exact component={MessageTemplateList} />
          </Switch>
          <MessageTemplate match={{ params: { id: 1 } }} />
        </Router>
      </MockedProvider>
    );
    await wait();
    const { queryByText } = within(container.querySelector('form'));
    const button = queryByText('Cancel');
    fireEvent.click(button);
    expect(getByText('Loading...')).toBeInTheDocument();
    await wait();
    expect(getByText('Speed sends')).toBeInTheDocument();
    unmount();
  });
});

describe('Save Button', () => {
  test('save button should add a new template', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <MessageTemplate match={{ params: { id: null } }} />
          <Switch>
            <Route path="/speed-send" exact component={MessageTemplateList} />
          </Switch>
        </Router>
      </MockedProvider>
    );

    await wait();
    fireEvent.change(container.querySelector('input[name="label"]'), {
      target: { value: 'new Template' },
    });
    fireEvent.change(container.querySelector('input[name="body"]'), {
      target: { value: 'new Template body' },
    });

    fireEvent.click(container.querySelector('input[name="isActive"]'));

    fireEvent.change(container.querySelector('input[name="languageId"]'), {
      target: { value: 1 },
    });
    const { queryByText } = within(container.querySelector('form'));
    const button = queryByText('Save');
    fireEvent.click(button);
    await wait();
    const { getByText } = within(container.querySelector('tbody'));
    expect(getByText('Good message')).toBeInTheDocument();
  });
});
