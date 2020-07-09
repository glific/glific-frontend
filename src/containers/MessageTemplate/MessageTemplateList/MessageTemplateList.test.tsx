import React from 'react';
import { render, wait, screen, cleanup } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { GET_LANGUAGES } from '../../../graphql/queries/Tag';
import { GET_TEMPLATES_COUNT, FILTER_TEMPLATES } from '../../../graphql/queries/Template';
import { MessageTemplateList } from './MessageTemplateList';
import { DELETE_TEMPLATE } from '../../../graphql/mutations/Template';
import { Switch, Route } from 'react-router-dom';
import { within, fireEvent } from '@testing-library/dom';
import { MessageTemplate } from '../MessageTemplate';

afterEach(cleanup);
const mocks = [
  {
    request: {
      query: DELETE_TEMPLATE,
      variables: {
        id: '87',
      },
    },
    result: {
      data: {
        deleteSessionTemplate: {
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
];

describe('<MessageTemplateList />', () => {
  it('should have loading', async () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <MessageTemplateList />
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
          <MessageTemplateList />
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
          <MessageTemplateList />
        </Router>
      </MockedProvider>
    );
    await wait();
    expect(container.querySelector('table')).toBeInTheDocument();
  });

  test('MessageTemplateList has proper headers', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <MessageTemplateList />
        </Router>
      </MockedProvider>
    );

    await wait();
    const { getByText } = within(container.querySelector('thead'));
    expect(getByText('LABEL')).toBeInTheDocument();
    expect(getByText('BODY')).toBeInTheDocument();
    expect(getByText('ACTIONS')).toBeInTheDocument();
  });

  test('A row in the table should have an edit and delete button', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <MessageTemplateList />
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
            <Route path="/speed-send/add" exact component={MessageTemplate} />
          </Switch>
          <MessageTemplateList />
        </Router>
      </MockedProvider>
    );
    await wait();
    const button = container.querySelector('button.MuiButton-containedPrimary');
    fireEvent.click(button);
    await wait();
    expect(container.querySelector('div.TemplateAdd')).toBeInTheDocument();
  });

  test('edit Button contains a route to edit page', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <Switch>
            <Route path="/speed-send/add" exact component={MessageTemplate} />
          </Switch>
          <MessageTemplateList />
        </Router>
      </MockedProvider>
    );
    await wait();
    expect(container.querySelector('tbody tr a').getAttribute('href')).toBe('/speed-send/87/edit');
  });
});

describe('<Dialogbox />', () => {
  test('click on delete button opens dialog box', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
          <MessageTemplateList />
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
          <MessageTemplateList />
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
