import 'mocks/matchMediaMock';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Routes, Route } from 'react-router-dom';
import { within, fireEvent } from '@testing-library/dom';

import { Flow } from 'containers/Flow/Flow';
import { setUserSession } from 'services/AuthService';
import { LIST_MOCKS, defaultProps } from './List.test.helper';
import { List } from './List';

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
  test('should have loading', async () => {
    const { getByTestId } = render(list);
    await waitFor(() => {
      expect(getByTestId('loading')).toBeInTheDocument();
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
      fireEvent.change(getByTestId('searchInput').querySelector('input') as HTMLElement, {
        target: { value: 'help' },
      });
    });

    await waitFor(() => {
      fireEvent.submit(getByTestId('searchForm'));
      fireEvent.click(getByTestId('resetButton'));
    });
  });

  test('list has proper headers', async () => {
    const { container } = render(list);
    await waitFor(() => {
      const tableHead = container.querySelector('thead') as HTMLTableSectionElement;
      const { getByText } = within(tableHead);
      expect(getByText('Title')).toBeInTheDocument();
      expect(getByText('Last published')).toBeInTheDocument();
      expect(getByText('Last saved in Draft')).toBeInTheDocument();
      expect(getByText('Actions')).toBeInTheDocument();
    });
  });

  test('A row in the table should have an edit and delete button', async () => {
    render(list);
    // Wait for the MoreIcon to appear and become clickable
    await waitFor(() => {
      expect(screen.getAllByTestId('MoreIcon')[0]).toBeInTheDocument();
    });
    const moreButton = screen.getAllByTestId('MoreIcon');
    fireEvent.click(moreButton[0]);
    await waitFor(() => {
      expect(screen.getAllByTestId('EditIcon')[0]).toBeInTheDocument();
      expect(screen.getAllByTestId('DeleteIcon')[0]).toBeInTheDocument();
    });
  });
});

const listButtons = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <Routes>
        <Route path="/" element={<List {...defaultProps} />} />
        <Route path="flow/add" element={<Flow />} />
      </Routes>
    </Router>
  </MockedProvider>
);

describe('<List /> actions', () => {
  test('add new Button contains a route to add new page', async () => {
    const { container } = render(listButtons);
    await waitFor(() => {
      const button = container.querySelector(
        'button.MuiButton-containedPrimary'
      ) as HTMLButtonElement;
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByTestId('add-container')).toBeInTheDocument();
    });
  });

  test('click on delete button opens dialog box', async () => {
    const { queryByTestId } = render(list);
    // Wait for the MoreIcon to appear and become clickable
    const moreButton = await screen.findAllByTestId('MoreIcon', {}, { timeout: 5000 });
    fireEvent.click(moreButton[0]);
    await waitFor(() => {
      const button = queryByTestId('DeleteIcon') as HTMLButtonElement;
      fireEvent.click(button);
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
    });
  });

  test('click on agree button shows alert', async () => {
    const { getAllByTestId } = render(list);
    const moreButton = await screen.findAllByTestId('MoreIcon', {}, { timeout: 5000 });
    fireEvent.click(moreButton[0]);

    await waitFor(() => {
      const button = getAllByTestId('DeleteIcon')[0];
      fireEvent.click(button);
    });

    await waitFor(() => {
      const agreeButton = screen
        .queryByRole('dialog')
        ?.querySelector('button.MuiButton-outlinedSecondary') as HTMLButtonElement;
      fireEvent.click(agreeButton);
    });
  });
});

test('list sorting', async () => {
  const { container } = render(list);
  await waitFor(() => {
    const tableHead = container.querySelector('thead') as HTMLTableSectionElement;
    const { getByText } = within(tableHead);
    fireEvent.click(getByText('Title'));
  });
});
