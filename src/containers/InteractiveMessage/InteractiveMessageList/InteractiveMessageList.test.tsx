import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { BrowserRouter as Router } from 'react-router';

import {
  customUiInteractiveCountQuery,
  filterByTagInteractiveQuery,
  filterCustomUiInteractiveQuery,
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
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
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

  fireEvent.click(screen.getAllByTestId('copy-interactive-message')[0]);

  await waitFor(() => {
    expect(mockedUsedNavigate).toHaveBeenCalled();
  });
});

describe('channel compatibility badge', () => {
  const customUiList = (
    <MockedProvider
      mocks={[filterCustomUiInteractiveQuery, customUiInteractiveCountQuery, getFilterTagQuery]}
      addTypename={false}
    >
      <Router>
        <InteractiveMessageList />
      </Router>
    </MockedProvider>
  );

  test('labels Custom UI as web only and the WhatsApp-capable types as Web + WhatsApp', async () => {
    render(customUiList);

    await waitFor(() => {
      expect(screen.getByText('Course picker')).toBeInTheDocument();
    });

    expect(screen.getByText('Custom UI')).toBeInTheDocument();
    expect(screen.getByText('Web only')).toBeInTheDocument();
    expect(screen.getByText('Web + WhatsApp')).toBeInTheDocument();
    expect(screen.getAllByTestId('channelCompatibilityBadge')).toHaveLength(2);
  });

  test('shows the fallback text as the message body for Custom UI rows', async () => {
    render(customUiList);

    await waitFor(() => {
      expect(screen.getByText('Pick a course: Spoken English or Digital skills')).toBeInTheDocument();
    });
  });

  test('shows the translated fallback in the all-languages row', async () => {
    render(customUiList);

    await waitFor(() => {
      expect(screen.getByText('Course picker')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId('down-arrow')[1]);

    await waitFor(() => {
      expect(screen.getByText('कोर्स चुनें')).toBeInTheDocument();
    });
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
