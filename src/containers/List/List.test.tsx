import React from 'react';
import { render, wait, screen, cleanup, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Tag } from '../Tag/Tag';
import { List } from './List';

import { Switch, Route } from 'react-router-dom';
import { within, fireEvent, waitFor } from '@testing-library/dom';
import { LIST_MOCKS, defaultProps } from './List.test.helper';
import { setUserSession } from '../../services/AuthService';

const mocks = LIST_MOCKS;

setUserSession(JSON.stringify({ roles: ['Admin'] }));

const list = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <List {...defaultProps} />
    </Router>
  </MockedProvider>
);

afterEach(cleanup);
describe('<List />', () => {
  test('should have loading', () => {
    const { getByText } = render(list);
    act(() => {
      expect(getByText('Loading...')).toBeInTheDocument();
    });
  });

  test('should have add new button', async () => {
    const { container } = render(list);
    await waitFor(() => {
      expect(container.querySelector('button.MuiButton-containedPrimary')).toBeInTheDocument();
    });
  });

  test('should have a table, search and reset', async () => {
    const { container, getByTestId } = render(list);

    await waitFor(() => {
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    fireEvent.change(getByTestId('searchInput')?.querySelector('input'), {
      target: { value: 'Unread' },
    });

    await waitFor(() => {
      fireEvent.submit(getByTestId('searchForm'));
      fireEvent.click(getByTestId('resetButton'));
    });
  });

  test('list has proper headers', async () => {
    const { container } = render(list);
    await waitFor(() => {
      const tableHead = container.querySelector('thead');
      const { getByText } = within(tableHead);
      expect(getByText('LABEL')).toBeInTheDocument();
      expect(getByText('DESCRIPTION')).toBeInTheDocument();
      expect(getByText('KEYWORDS')).toBeInTheDocument();
      expect(getByText('ACTIONS')).toBeInTheDocument();
    });
  });

  test('A row in the table should have an edit and delete button', async () => {
    const { container } = render(list);

    await waitFor(() => {
      const tableRow = container.querySelector('tbody tr');
      const { getByLabelText } = within(tableRow);
      expect(getByLabelText('Edit')).toBeInTheDocument();
      expect(getByLabelText('Delete')).toBeInTheDocument();
    });
  });
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

describe('<List /> actions', () => {
  test('add new Button contains a route to add new page', async () => {
    const { container } = render(listButtons);
    await waitFor(() => {
      const button = container.querySelector('button.MuiButton-containedPrimary');
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(container.querySelector('div.ItemAdd')).toBeInTheDocument();
    });
  });

  test('click on delete button opens dialog box', async () => {
    const { container } = render(list);

    await waitFor(() => {
      const { queryByLabelText } = within(container.querySelector('tbody tr'));
      const button = queryByLabelText('Delete');
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
    });
  });

  test('click on agree button shows alert', async () => {
    const { getAllByTestId } = render(list);

    await waitFor(() => {
      const button = getAllByTestId('DeleteIcon')[0];
      fireEvent.click(button);
    });

    await waitFor(() => {
      const agreeButton = screen
        .queryByRole('dialog')
        ?.querySelector('button.MuiButton-containedSecondary');
      fireEvent.click(agreeButton);
    });
  });
});
