import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router-dom';

import {
  filterByTagInteractiveQuery,
  filterInteractiveQuery,
  getFilterInteractiveCountQuery,
  getInteractiveCountQuery,
} from 'mocks/InteractiveMessage';
import { setUserSession } from 'services/AuthService';
import InteractiveMessageList from './InteractiveMessageList';
import { getFilterTagQuery } from 'mocks/Tag';

const mocks = [
  filterInteractiveQuery,
  filterInteractiveQuery,
  getInteractiveCountQuery,
  getFilterTagQuery,
  filterByTagInteractiveQuery,
  getFilterInteractiveCountQuery,
];
setUserSession(JSON.stringify({ roles: ['Admin'] }));

beforeEach(() => {
  cleanup();
});

const list = (
  <MockedProvider mocks={mocks} addTypename={false}>
    <Router>
      <InteractiveMessageList />
    </Router>
  </MockedProvider>
);

const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUsedNavigate,
}));

test('Interactive message list renders correctly', async () => {
  render(list);
  expect(screen.getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    const title = screen.getByText('Interactive messages');
    const label = screen.getByText('Title');
    const messageBody = screen.getByText('Message');
    const type = screen.getByText('Type');

    expect(title).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(messageBody).toBeInTheDocument();
    expect(type).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('Are you excited for Glific?')).toBeInTheDocument();
    expect(screen.getAllByText('Quick Reply')[0]).toBeInTheDocument();
  });
});

test('should navigate to create template page', async () => {
  render(list);

  await waitFor(() => {
    expect(screen.getByText('Interactive messages')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('newItemButton'));

  expect(mockedUsedNavigate).toHaveBeenCalledWith('/interactive-message/add');
});

test('Translation is shown', async () => {
  render(list);
  expect(screen.getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Interactive messages')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('down-arrow')[0]);

  await waitFor(() => {
    expect(screen.getByText('ग्लिफ़िक सभी नई सुविधाओं के साथ आता है')).toBeInTheDocument();
  });
});

test('It navigates to edit on clicking copy ', async () => {
  render(list);
  expect(screen.getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Interactive messages')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('MoreIcon')[0]);
  fireEvent.click(screen.getByText('Copy'));

  await waitFor(() => {
    expect(mockedUsedNavigate).toHaveBeenCalled();
  });
});

test('It changes tag filter value', async () => {
  render(list);
  expect(screen.getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Interactive messages')).toBeInTheDocument();
  });

  const autoComplete = screen.getAllByRole('combobox')[0];

  autoComplete.focus();
  fireEvent.keyDown(autoComplete, { key: 'ArrowDown' });
  fireEvent.keyDown(autoComplete, { key: 'ArrowDown' });
  fireEvent.keyDown(autoComplete, { key: 'Enter' });

  await waitFor(() => {
    expect(autoComplete).toHaveValue('Messages');
  });

  fireEvent.click(screen.getByTestId('newItemButton'));
  expect(mockedUsedNavigate).toHaveBeenCalledWith('/interactive-message/add', {
    state: { tag: { label: 'Messages', id: '1' } },
  });
});
