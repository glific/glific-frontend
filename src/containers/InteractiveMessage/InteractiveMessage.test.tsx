import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'mocks/matchMediaMock';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';
import { Route, MemoryRouter, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import { setUserSession } from 'services/AuthService';
import { mocks } from 'mocks/InteractiveMessage';
import { InteractiveMessage } from './InteractiveMessage';
import { FLOW_EDITOR_API } from 'config';
import { setNotification } from 'common/notification';

afterEach(() => {
  cleanup();
});

const mockIntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

(window as any).IntersectionObserver = mockIntersectionObserver;

const mockUseLocationValue: any = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};
vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual<any>('react-router-dom')) as {}),
  useLocation: () => {
    return mockUseLocationValue;
  },
  Navigate: ({ to }: any) => <div>Navigated to {to}</div>,
}));

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return {
    ...mod,
    setNotification: vi.fn(),
  };
});

// mocking emoji picker to easily fill message field with an emoji
vi.mock('components/UI/EmojiPicker/EmojiPicker', async (importOriginal) => {
  const mod = await importOriginal<typeof import('components/UI/EmojiPicker/EmojiPicker')>();
  return {
    ...mod,
    EmojiPicker: vi.fn((props: any) => {
      const mockEmoji = {
        id: 'grinning',
        name: 'Grinning Face',
        colons: ':grinning:',
        text: '',
        emoticons: [],
        skin: null,
        native: '😀',
      };
      const Picker: any = (
        <input
          data-testid="emoji-container"
          onClick={() => {
            props.onEmojiSelect(mockEmoji);
          }}
          onChange={(event) => props.onChange(event)}
        ></input>
      );
      return Picker;
    }),
  };
});

const mockData = [...mocks, ...mocks];

setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const renderInteractiveMessage = (id: string) => (
  <MockedProvider mocks={mockData} addTypename={false}>
    <MemoryRouter initialEntries={[`/interactive-message/${id}/edit`]}>
      <Routes>
        <Route path="interactive-message/:id/edit" element={<InteractiveMessage />} />
      </Routes>
    </MemoryRouter>
  </MockedProvider>
);

const interactiveMessage = (
  <MockedProvider mocks={mockData} addTypename={false}>
    <MemoryRouter>
      <InteractiveMessage />
    </MemoryRouter>
  </MockedProvider>
);

const fieldsMock = {
  results: [{ key: 'key 1' }, { key: 'key 2' }],
};

const completionMock = {
  context: {
    types: [
      {
        name: 'contact',
        properties: [
          {
            help: 'the numeric ID of the contact',
            key: 'id',
            type: 'text',
          },
          {
            help: 'the name of the contact',
            key: 'name',
            type: 'text',
          },

          {
            help: 'the language of the contact as 3-letter ISO code',
            key: 'language',
            type: 'text',
          },
        ],
      },
    ],
  },
};

// Getting contact variables
vi.spyOn(axios, 'get').mockImplementation((url: string) => {
  if (url === `${FLOW_EDITOR_API}fields`) {
    return Promise.resolve({ data: fieldsMock });
  } else if (url === `${FLOW_EDITOR_API}completion`) {
    return Promise.resolve({ data: completionMock });
  } else {
    return Promise.resolve({ data: {} });
  }
});

test('it renders empty interactive form', async () => {
  render(interactiveMessage);

  // Adding another quick reply button
  await waitFor(() => {
    expect(screen.getByTestId('addButton')).toBeInTheDocument();
  });

  const addQuickReplyButton = screen.getByTestId('addButton');
  fireEvent.click(addQuickReplyButton);

  await waitFor(() => {
    // Get all input elements
    const [title, lexicalEditor, quickReply1, quickReply2, , attachmentUrl] =
      screen.getAllByRole('textbox');
    expect(title).toBeInTheDocument();
    expect(quickReply1).toBeInTheDocument();
    expect(quickReply2).toBeInTheDocument();
    expect(attachmentUrl).toBeInTheDocument();

    fireEvent.change(title, { target: { value: 'new title' } });
    userEvent.click(lexicalEditor);
    userEvent.keyboard('Yes');
    fireEvent.change(quickReply1, { target: { value: 'Yes' } });
    fireEvent.change(quickReply2, { target: { value: 'No' } });
    fireEvent.change(attachmentUrl, { target: { value: 'https://picsum.photos/200/300' } });
    fireEvent.blur(attachmentUrl);
  });

  // // Changing language to marathi
  await waitFor(() => {
    expect(screen.getByText('Marathi')).toBeInTheDocument();
  });

  const language = screen.getByText('Marathi');
  fireEvent.click(language);

  await waitFor(() => {
    const [interactiveType] = screen.getAllByTestId('autocomplete-element');
    expect(interactiveType).toBeInTheDocument();
  });

  // Switiching to list
  const [interactiveType] = screen.getAllByTestId('autocomplete-element');
  interactiveType.focus();
  fireEvent.keyDown(interactiveType, { key: 'ArrowDown' });
  fireEvent.keyDown(interactiveType, { key: 'ArrowDown' });
  fireEvent.keyDown(interactiveType, { key: 'Enter' });

  await waitFor(() => {
    // Adding list data
    const [, , header, listTitle, listItemTitle, listItemDesc] = screen.getAllByRole('textbox');

    expect(header).toBeInTheDocument();
    expect(listTitle).toBeInTheDocument();
    expect(listItemTitle).toBeInTheDocument();
    expect(listItemDesc).toBeInTheDocument();

    fireEvent.change(header, { target: { value: 'Section 1' } });
    fireEvent.blur(header);
    fireEvent.change(listTitle, { target: { value: 'title' } });
    fireEvent.change(listItemTitle, { target: { value: 'red' } });
    fireEvent.change(listItemDesc, { target: { value: 'red is color' } });
  });

  await waitFor(() => {
    // Adding another list item
    const addAnotherListItemButton = screen.getByText('Add item');
    expect(addAnotherListItemButton);
    fireEvent.click(addAnotherListItemButton);
  });

  await waitFor(() => {
    // Adding another list
    const addAnotherListButton = screen.getByText('Add list');
    expect(addAnotherListButton);
    fireEvent.click(addAnotherListButton);
  });

  await waitFor(() => {
    expect(screen.getAllByTestId('delete-icon')).toHaveLength(2);
  });
  // Deleting list
  const deleteListButton = screen.getAllByTestId('delete-icon')[1];
  fireEvent.click(deleteListButton);
  await waitFor(() => {
    // Deleting list item
    const deleteListItemButton = screen.getByTestId('cross-icon');
    expect(deleteListItemButton).toBeInTheDocument();
    fireEvent.click(deleteListItemButton);
  });

  // Fill Message field with an emoji (as it's a required field)
  await userEvent.click(screen.getByTestId('emoji-picker'));
  const emojiContainer = screen.getByTestId('emoji-container');
  await userEvent.click(emojiContainer);

  await waitFor(() => {
    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeInTheDocument();
    fireEvent.click(saveButton);
  });

  // successful save
  await waitFor(() => {
    expect(setNotification).toHaveBeenCalledWith('Interactive message created successfully!');
  });
});

test('it renders interactive quick reply in edit mode', async () => {
  render(renderInteractiveMessage('1'));

  await waitFor(() => {
    // Changing language to marathi to see translations
    expect(screen.getByText('Marathi')).toBeInTheDocument();
  });

  const marathi = screen.getByText('Marathi');
  fireEvent.click(marathi);

  await waitFor(() => {
    expect(screen.getByText('English')).toBeInTheDocument();
  });
  // Changing back to English
  const english = screen.getByText('English');
  fireEvent.click(english);

  await waitFor(() => {
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
  const saveButton = screen.getByText('Save');
  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(screen.getByText('Navigated to /interactive-message')).toBeInTheDocument();
  });
});

test('it renders interactive list in edit mode', async () => {
  render(renderInteractiveMessage('2'));

  // vi.spyOn(axios, 'get').mockResolvedValueOnce(responseMock1);

  await waitFor(() => {
    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeInTheDocument();
    fireEvent.click(saveButton);
  });
});

test('it renders interactive quick reply with media in edit mode', async () => {
  render(renderInteractiveMessage('3'));

  // vi.spyOn(axios, 'get').mockResolvedValueOnce(responseMock3);
});

test('it validates url', async () => {
  const { getByText, getAllByRole } = render(interactiveMessage);

  await waitFor(() => {
    expect(getByText('Add a new Interactive message')).toBeInTheDocument();
  });

  const autoCompletes = getAllByRole('combobox');

  const attachmentType = autoCompletes[1];

  attachmentType.focus();
  fireEvent.keyDown(attachmentType, { key: 'ArrowDown' });
  fireEvent.keyDown(attachmentType, { key: 'ArrowDown' });
  fireEvent.keyDown(attachmentType, { key: 'Enter' });

  fireEvent.change(getAllByRole('textbox')[4], { target: { value: 'bhhdhds' } });
});

describe('copy interactive message', () => {
  test('it renders copy interactive quick reply message', async () => {
    mockUseLocationValue.state = 'copy';

    const { getByText, getAllByTestId } = render(renderInteractiveMessage('1'));
    // vi.spyOn(axios, 'get').mockResolvedValueOnce(responseMock1);

    await waitFor(() => {
      expect(getByText('Copy Interactive Message')).toBeInTheDocument();
      const input = getAllByTestId('input');
      expect(input[0]?.querySelector('input')).toHaveValue('Copy of Continue');
    });
  });
});

describe('location request message', () => {
  test('it renders empty location request message', async () => {
    render(interactiveMessage);

    await waitFor(() => {
      expect(screen.getAllByTestId('autocomplete-element')[0]).toBeInTheDocument();
    });
    const [interactiveType] = screen.getAllByTestId('autocomplete-element');

    // Switiching to location request
    interactiveType.focus();
    fireEvent.keyDown(interactiveType, { key: 'ArrowDown' });
    fireEvent.keyDown(interactiveType, { key: 'ArrowDown' });
    fireEvent.keyDown(interactiveType, { key: 'ArrowDown' });
    fireEvent.keyDown(interactiveType, { key: 'Enter' });
    await waitFor(() => {
      expect(interactiveType.querySelector('input')).toHaveValue('Location request');
    });

    fireEvent.change(
      screen.getAllByTestId('outlinedInput')[0]?.querySelector('input') as HTMLElement,
      {
        target: { value: 'Section 1' },
      }
    );

    // have send location in simulator preview
    await waitFor(() => {
      expect(screen.getByText('Send Location')).toBeInTheDocument();
    });
  });
});
