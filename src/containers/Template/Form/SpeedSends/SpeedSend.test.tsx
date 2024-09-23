import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router';
import SpeedSends from './SpeedSends';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SPEED_SENDS_MOCKS } from '../../Template.test.helper';
import { LexicalWrapper } from 'common/LexicalWrapper';
import userEvent from '@testing-library/user-event';
import * as Notification from 'common/notification';
import SpeedSendList from '../../List/SpeedSendList/SpeedSendList';
import * as utilsModule from 'common/utils';

beforeEach(() => {
  vi.clearAllMocks();
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

const addSpeedSendContainer = (
  <LexicalWrapper>
    <MockedProvider mocks={SPEED_SENDS_MOCKS}>
      <MemoryRouter initialEntries={['/speed-send/add']}>
        <Routes>
          <Route path="/speed-send/add" element={<SpeedSends />} />
          <Route path="/speed-send" element={<SpeedSendList />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  </LexicalWrapper>
);

const editSpeedSendContainer = (id: string) => (
  <LexicalWrapper>
    <MockedProvider mocks={SPEED_SENDS_MOCKS}>
      <MemoryRouter initialEntries={[`/speed-send/${id}/edit`]}>
        <Routes>
          <Route path="/speed-send/:id/edit" element={<SpeedSends />} />
          <Route path="/speed-send" element={<SpeedSendList />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  </LexicalWrapper>
);

const user = userEvent.setup();
const notificationSpy = vi.spyOn(Notification, 'setNotification');
const validateMediaSpy = vi.spyOn(utilsModule, 'validateMedia');

describe('test creating a speed send', () => {
  test('should render the speed send form', async () => {
    render(addSpeedSendContainer);

    await waitFor(() => {
      expect(screen.getByText('Add a new Speed send')).toBeInTheDocument();
    });
  });

  test('should create a speed send', async () => {
    render(addSpeedSendContainer);

    await waitFor(() => {
      expect(screen.getByText('Add a new Speed send')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    const lexicalEditor = inputs[1];

    await user.click(lexicalEditor);
    await user.tab();
    fireEvent.input(lexicalEditor, { data: 'Hi, How are you' });

    await waitFor(() => {
      expect(screen.getByText('Hi, How are you')).toBeInTheDocument();
    });

    fireEvent.change(inputs[0], { target: { value: 'Template' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });

  test('should validate media', async () => {
    render(addSpeedSendContainer);

    await waitFor(() => {
      expect(screen.getByText('Add a new Speed send')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    autocompletes[0].focus();
    fireEvent.keyDown(autocompletes[0], { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('IMAGE'), { key: 'Enter' });

    fireEvent.change(inputs[2], {
      target: {
        value: 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample02.jpg',
      },
    });

    await waitFor(() => {
      expect(validateMediaSpy).toHaveBeenCalled();
      expect(screen.getByText('Validating URL')).toBeInTheDocument();
    });
  });
});

describe('test editing a speed send', () => {
  test('should render speed send form', async () => {
    render(editSpeedSendContainer('2'));

    await waitFor(() => {
      expect(screen.getByText('Edit Speed send')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('sample title')).toBeInTheDocument();
    });
  });

  test('should show translations', async () => {
    render(editSpeedSendContainer('1'));

    await waitFor(() => {
      expect(screen.getByText('Edit Speed send')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('title1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Marathi'));

    await waitFor(() => {
      expect(screen.getByTestId('translation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('English'));

    await waitFor(() => {
      expect(screen.getByText('title1')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Save'));
    });

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });
});
