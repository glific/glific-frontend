import { render, within, fireEvent, cleanup, waitFor, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { Routes, Route } from 'react-router-dom';
import { SpeedSendList } from 'containers/Template/List/SpeedSendList/SpeedSendList';
import { SPEED_SENDS_MOCKS } from 'containers/Template/Template.test.helper';
import { setUserSession } from 'services/AuthService';
import { SpeedSend } from './SpeedSend';
import * as Notification from 'common/notification';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { BeautifulMentionNode } from 'lexical-beautiful-mentions';

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

describe('SpeedSend', () => {
  test('cancel button should redirect to SpeedSendlist page', async () => {
    const { container, getByText } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<SpeedSend />} />
            <Route path="/speed-send" element={<SpeedSendList />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      const { queryByText } = within(container.querySelector('form') as HTMLElement);
      const button = queryByText('Cancel') as HTMLButtonElement;
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(getByText('Speed sends')).toBeInTheDocument();
    });
  });

  test('should have correct validations ', async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <LexicalComposer
            initialConfig={{
              namespace: 'template-input',
              onError: (error) => console.log(error),
              nodes: [BeautifulMentionNode],
            }}
          >
            <Routes>
              <Route path="/" element={<SpeedSend />} />
              <Route path="/speed-send" element={<SpeedSendList />} />
            </Routes>
          </LexicalComposer>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      fireEvent.change(container.querySelector('input[name="label"]') as HTMLInputElement, {
        target: { value: 'new Template' },
      });
    });

    const { queryByText } = within(container.querySelector('form') as HTMLElement);
    await waitFor(() => {
      const button = queryByText('Save') as HTMLButtonElement;
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(queryByText('Title is required.')).toBeInTheDocument();
    });
  });

  test('should test translations', async () => {
    const notificationSpy = vi.spyOn(Notification, 'setNotification');
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/speed-send/1/edit']}>
          <Routes>
            <Route path="speed-send/:id/edit" element={<SpeedSend />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Marathi')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Marathi'));

    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('English'));

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });
});
