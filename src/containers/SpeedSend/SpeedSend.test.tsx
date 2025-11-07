import { MockedProvider } from '@apollo/client/testing';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';

import * as Notification from 'common/notification';
import { LexicalWrapper } from 'common/LexicalWrapper';
import * as utilsModule from 'common/utils';
import { SPEED_SENDS_MOCKS } from 'mocks/Template';
import SpeedSendList from './SpeedSendList/SpeedSendList';
import SpeedSend from './SpeedSend';
import axios from 'axios';

vi.mock('lexical-beautiful-mentions', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('lexical-beautiful-mentions');
  return {
    ...actual,
    BeautifulMentionsPlugin: ({ children }: any) => <div>{children}</div>,
    BeautifulMentionsMenuProps: {},
    BeautifulMentionsMenuItemProps: {},
  };
});

const mockedAxios = axios as any;
vitest.mock('axios');

beforeEach(() => {
  cleanup();
});

afterEach(() => {
  mockedAxios.get.mockReset();
});

const addSpeedSendContainer = (
  <LexicalWrapper>
    <MockedProvider mocks={SPEED_SENDS_MOCKS}>
      <MemoryRouter initialEntries={['/speed-send/add']}>
        <Routes>
          <Route path="/speed-send/add" element={<SpeedSend />} />
          <Route path="/speed-send" element={<SpeedSendList />} />
          <Route path="/speed-send/:id/edit" element={<SpeedSend />} />
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
          <Route path="/speed-send/:id/edit" element={<SpeedSend />} />
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

  test('should validate media', async () => {
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve({ data: { is_valid: true, message: 'valid media' } }));

    render(addSpeedSendContainer);

    await waitFor(() => {
      expect(screen.getByText('Add a new Speed send')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    const autocompletes = screen.getAllByTestId('autocomplete-element');
    autocompletes[0].focus();
    fireEvent.keyDown(autocompletes[0], { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('IMAGE URL'), { key: 'Enter' });

    fireEvent.blur(inputs[2], {
      target: {
        value: 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample02.jpg',
      },
    });

    await waitFor(() => {
      expect(validateMediaSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Validating URL')).toBeInTheDocument();
    });
  });

  test('should show invalid media message', async () => {
    mockedAxios.get.mockImplementationOnce(() =>
      Promise.resolve({ data: { message: 'This media URL is invalid', is_valid: false } })
    );

    render(addSpeedSendContainer);

    await waitFor(() => {
      expect(screen.getByText('Add a new Speed send')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    autocompletes[0].focus();
    fireEvent.keyDown(autocompletes[0], { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('IMAGE URL'), { key: 'Enter' });

    fireEvent.change(inputs[2], {
      target: { value: 'invalid media' },
    });

    fireEvent.blur(inputs[2]);
    await waitFor(() => {
      expect(validateMediaSpy).toHaveBeenCalled();
      expect(screen.getByText('Validating URL')).toBeInTheDocument();
    });
  });

  test('should create a speed send', async () => {
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve({ data: { is_valid: true, message: 'valid media' } }));

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

    fireEvent.click(screen.getByText('Marathi'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    autocompletes[0].focus();
    fireEvent.keyDown(autocompletes[0], { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('STICKER URL'), { key: 'Enter' });

    fireEvent.change(inputs[2], {
      target: {
        value: 'https://www.buildquickbots.com/whatsapp/media/sample/jpg/sample02.jpg',
      },
    });

    fireEvent.change(inputs[0], { target: { value: 'Template' } });

    fireEvent.click(screen.getByText('Marathi'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });

  test('it should display warning message', async () => {
    render(addSpeedSendContainer);

    await waitFor(() => {
      expect(screen.getByText('Add a new Speed send')).toBeInTheDocument();
    });

    const autocompletes = screen.getAllByTestId('autocomplete-element');
    autocompletes[0].focus();
    fireEvent.keyDown(autocompletes[0], { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('STICKER URL'), { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Animated stickers are not supported.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('CloseIcon'));

    autocompletes[0].focus();
    fireEvent.keyDown(autocompletes[0], { key: 'ArrowDown' });

    fireEvent.click(screen.getByText('AUDIO URL'), { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Captions along with audio are not supported.')).toBeInTheDocument();
    });
  });

  test('it should show errors if they exist', async () => {
    render(addSpeedSendContainer);

    await waitFor(() => {
      expect(screen.getByText('Add a new Speed send')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');
    const autocompletes = screen.getAllByTestId('autocomplete-element');

    autocompletes[0].focus();
    fireEvent.keyDown(autocompletes[0], { key: 'ArrowDown' });
    fireEvent.click(screen.getByText('IMAGE URL'), { key: 'Enter' });

    fireEvent.change(inputs[0], { target: { value: 'Template' } });

    fireEvent.click(screen.getByText('Marathi'));

    await waitFor(() => {
      expect(notificationSpy).toHaveBeenCalled();
    });
  });
});

describe('test editing a speed send', () => {
  test('should render speed send form', async () => {
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve({ data: { is_valid: true, message: 'valid media' } }));

    render(editSpeedSendContainer('2'));

    await waitFor(() => {
      expect(screen.getByText('Edit Speed send')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Marathi')).toBeInTheDocument();
    });
  });

  test('should show translations', async () => {
    render(editSpeedSendContainer('1'));

    await waitFor(() => {
      expect(screen.getByText('Edit Speed send')).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole('textbox');

    await waitFor(() => {
      expect(inputs[0]).toHaveValue('title1');
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
