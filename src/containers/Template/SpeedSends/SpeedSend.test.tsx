import { render, fireEvent, cleanup, waitFor, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Routes, Route } from 'react-router-dom';
import { SpeedSendList } from 'containers/Template/List/SpeedSendList/SpeedSendList';
import { SPEED_SENDS_MOCKS } from 'containers/Template/Template.test.helper';
import { setUserSession } from 'services/AuthService';
import { SpeedSends } from './SpeedSends';
import * as Notification from 'common/notification';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { BeautifulMentionNode } from 'lexical-beautiful-mentions';
import userEvent from '@testing-library/user-event';

setUserSession(JSON.stringify({ roles: ['Admin'] }));

const mocks = SPEED_SENDS_MOCKS;

const mockIntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

(window as any).IntersectionObserver = mockIntersectionObserver;

afterEach(() => {
  cleanup();
});

vi.mock('lexical-beautiful-mentions', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('lexical-beautiful-mentions');
  return {
    ...actual,
    BeautifulMentionsPlugin: ({ children }: any) => <div>{children}</div>,
    BeautifulMentionsMenuProps: {},
    BeautifulMentionsMenuItemProps: {},
  };
});

const user = userEvent.setup();

describe('SpeedSend', () => {
  test('cancel button should redirect to SpeedSendlist page', async () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/speed-send/add']}>
          <Routes>
            <Route path="/speed-send/add" element={<SpeedSends />} />
            <Route path="/speed-send" element={<SpeedSendList />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      fireEvent.click(getByText('Cancel'));
    });

    await waitFor(() => {
      expect(getByText('Speed sends')).toBeInTheDocument();
    });
  });

  test('should have correct validations ', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/speed-send/add']}>
          <LexicalComposer
            initialConfig={{
              namespace: 'template-input',
              onError: (error) => console.log(error),
              nodes: [BeautifulMentionNode],
            }}
          >
            <Routes>
              <Route path="/speed-send/add" element={<SpeedSends />} />
              <Route path="/speed-send" element={<SpeedSendList />} />
            </Routes>
          </LexicalComposer>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Add a new Speed send')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Title is required.')).toBeInTheDocument();
    });
  });

  test('should test translations', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/speed-send/add']}>
          <Routes>
            <Route path="/speed-send/add" element={<SpeedSends />} />
            <Route path="/speed-send/:id/edit" element={<SpeedSends />} />
            <Route path="/speed-send" element={<SpeedSendList />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Add a new Speed send')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    const lexicalEditor = inputs[1];

    await user.click(lexicalEditor);
    await user.tab();
    fireEvent.input(lexicalEditor, { data: 'Hi, How are you' });

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    autocompletes[0].focus();
    fireEvent.keyDown(autocompletes[0], { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('IMAGE'), { key: 'Enter' });

    fireEvent.change(inputs[2], {
      target: { value: 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample02.jpg' },
    });

    await waitFor(() => {
      expect(screen.getByText('Hi, How are you')).toBeInTheDocument();
    });

    fireEvent.change(inputs[0], { target: { value: 'Template' } });

    fireEvent.click(screen.getByText('Marathi'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });
});
