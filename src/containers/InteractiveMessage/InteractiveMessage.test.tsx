import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';
import { Route, MemoryRouter, Routes } from 'react-router';
import { vi } from 'vitest';

import { setUserSession } from 'services/AuthService';
import {
  getTemplateMocks1,
  getTemplateMocks2,
  getTemplateMocks3,
  getTemplateMocks4,
  getTemplateMocks5,
  mocks,
  translateInteractiveTemplateMock,
  translateWitTrimmingMocks,
  translateWithoutTrimmingMocks,
} from 'mocks/InteractiveMessage';
import { InteractiveMessage } from './InteractiveMessage';
import { FLOW_EDITOR_API } from 'config';
import { setErrorMessage, setNotification } from 'common/notification';
import { UPLOAD_MEDIA } from 'graphql/mutations/Chat';

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

vi.mock('react-router', async () => ({
  ...((await vi.importActual<any>('react-router')) as {}),
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
    setErrorMessage: vi.fn(),
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

vi.mock('lexical-beautiful-mentions', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('lexical-beautiful-mentions');
  return {
    ...actual,
    BeautifulMentionsPlugin: ({ children }: any) => <div>{children}</div>,
    BeautifulMentionsMenuProps: {},
    BeautifulMentionsMenuItemProps: {},
  };
});

const mockData = [...mocks, ...mocks];

setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

const renderInteractiveMessage = (id: string, mocks: any) => {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={[`/interactive-message/${id}/edit`]}>
        <Routes>
          <Route path="interactive-message/:id/edit" element={<InteractiveMessage />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
};

const interactiveMessage = (mock?: any) => {
  let MOCKS = mockData;
  if (mock) {
    MOCKS = [...MOCKS, ...mock];
  }

  return (
    <MockedProvider mocks={MOCKS} addTypename={false}>
      <MemoryRouter>
        <InteractiveMessage />
      </MemoryRouter>
    </MockedProvider>
  );
};

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
const user = userEvent.setup();

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

describe('Add mode', () => {
  test('it renders empty interactive form', async () => {
    render(interactiveMessage());

    // Adding another quick reply button
    await waitFor(() => {
      expect(screen.getByTestId('addButton')).toBeInTheDocument();
    });

    const addQuickReplyButton = screen.getByTestId('addButton');
    fireEvent.click(addQuickReplyButton);

    await waitFor(() => {
      // Get all input elements
      const [title, lexicalEditor, quickReply1, quickReply2, , attachmentUrl] = screen.getAllByRole('textbox');
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
      expect(setNotification).toHaveBeenCalled();
    });
  });

  test('it validates url', async () => {
    const { getByText, getAllByRole } = render(interactiveMessage());

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

  test('It creates a interactive message with dynamic content', async () => {
    const { getByTestId, getAllByRole, getByText } = render(interactiveMessage());
    await waitFor(() => {
      expect(getByText('Marathi')).toBeInTheDocument();
    });

    fireEvent.click(getAllByRole('checkbox')[1]);

    const autoCompletes = getAllByRole('combobox');

    const attachmentType = autoCompletes[1];

    attachmentType.focus();
    fireEvent.keyDown(attachmentType, { key: 'ArrowDown' });
    fireEvent.keyDown(attachmentType, { key: 'ArrowDown' });
    fireEvent.keyDown(attachmentType, { key: 'Enter' });

    fireEvent.change(getAllByRole('textbox')[4], { target: { value: '@results.result_1' } });
    fireEvent.click(getByTestId('submitActionButton'));
  });

  test('it should show error if buttons have same text', async () => {
    render(interactiveMessage());

    await waitFor(() => {
      expect(screen.getByText('Add a new Interactive message')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('addButton'));

    const inputs = screen.getAllByPlaceholderText('Enter button text(20 char.)');
    await waitFor(() => {
      expect(inputs).toHaveLength(2);
    });

    fireEvent.change(inputs[0], { target: { value: 'yes' } });
    fireEvent.change(inputs[1], { target: { value: 'yes' } });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(screen.getByText('Button labels must be unique.')).toBeInTheDocument();
    });
  });
});

describe('Edit mode', () => {
  test('it renders quick reply in edit mode and changes language', async () => {
    render(renderInteractiveMessage('1', getTemplateMocks1));

    await waitFor(() => {
      expect(screen.getByText('Title*')).toBeInTheDocument();
      expect(screen.getByText('Are you excited for *Glific*?')).toBeInTheDocument();
      expect(screen.getByText('yes')).toBeInTheDocument();
      expect(screen.getByText('Marathi')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Marathi'));

    await waitFor(() => {
      expect(screen.getByTestId('translation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('English'));

    await waitFor(() => {
      expect(screen.queryAllByTestId('translation')).toHaveLength(0);
    });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
  });

  test('it renders interactive list in edit mode', async () => {
    render(renderInteractiveMessage('2', getTemplateMocks2));

    await waitFor(() => {
      expect(screen.getByText('List header*')).toBeInTheDocument();
    });
  });

  test('it renders interactive quick reply with media in edit mode', async () => {
    render(renderInteractiveMessage('3', getTemplateMocks3));

    await waitFor(() => {
      expect(screen.getByText('Button Text*')).toBeInTheDocument();
    });
  });

  test('it should show warning if markdown character exists on editing', async () => {
    render(renderInteractiveMessage('5', getTemplateMocks5));

    await waitFor(() => {
      expect(screen.getByText('Markdown content removed')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(screen.getByText('Edit Interactive message')).toBeInTheDocument();
    });
  });
});

describe('location request message', () => {
  test('it renders empty location request message', async () => {
    render(interactiveMessage());

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

    fireEvent.change(screen.getAllByTestId('outlinedInput')[0]?.querySelector('input') as HTMLElement, {
      target: { value: 'Section 1' },
    });

    // have send location in simulator preview
    await waitFor(() => {
      expect(screen.getByText('Send Location')).toBeInTheDocument();
    });
  });
});

describe('translates the template', () => {
  test('it shows error if clicked on translation without filling details', async () => {
    const { getByText } = render(interactiveMessage(translateWithoutTrimmingMocks));

    await waitFor(() => {
      expect(getByText('Add a new Interactive message')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('translateBtn'));

    await waitFor(() => {
      expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(getByText('Message content is required.')).toBeInTheDocument();
    });
  });

  test('it translates a new template', async () => {
    const { getByText } = render(interactiveMessage(translateWithoutTrimmingMocks));

    await waitFor(() => {
      expect(getByText('Add a new Interactive message')).toBeInTheDocument();
    });

    const [title, lexicalEditor, , buttonText] = screen.getAllByRole('textbox');

    fireEvent.change(title, { target: { value: 'new title' } });
    fireEvent.change(buttonText, {
      target: { value: 'new button text' },
    });
    await user.click(lexicalEditor);
    await user.tab();

    fireEvent.input(lexicalEditor, { data: 'Hi, How are you' });

    await waitFor(() => {
      expect(getByText('Hi, How are you')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('translateBtn'));

    await waitFor(() => {
      expect(getByText('Translate Options')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
  });

  test('it translates an already exisiting template', async () => {
    render(renderInteractiveMessage('1', translateWithoutTrimmingMocks));

    await waitFor(() => {
      expect(screen.getByText('Edit Interactive message')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('translateBtn'));

    await waitFor(() => {
      expect(screen.getByText('Translate Options')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Auto translate'));

    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
  });

  test('it shows error on translating an already exisiting template', async () => {
    render(renderInteractiveMessage('1', [...getTemplateMocks1, translateInteractiveTemplateMock(true)]));

    await waitFor(() => {
      expect(screen.getByText('Edit Interactive message')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('translateBtn'));

    await waitFor(() => {
      expect(screen.getByText('Translate Options')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Auto translate'));

    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(setErrorMessage).toHaveBeenCalled();
    });
  });

  test('it translates an already exisiting template with trimming', async () => {
    render(renderInteractiveMessage('1', translateWitTrimmingMocks));

    await waitFor(() => {
      expect(screen.getByText('Edit Interactive message')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('translateBtn'));

    await waitFor(() => {
      expect(screen.getByText('Translate Options')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Auto translate'));

    fireEvent.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Translations exceeding limit.')).toBeInTheDocument();
    });
  });

  test('it shows warning if contents are trimmed', async () => {
    render(renderInteractiveMessage('4', getTemplateMocks4));

    await waitFor(() => {
      expect(screen.getByText('Title*')).toBeInTheDocument();
      expect(screen.getByText('Marathi')).toBeInTheDocument();
      expect(screen.getByText('Are you excited for *Glific*?')).toBeInTheDocument();
      expect(screen.getByText('yes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Marathi'));

    await waitFor(() => {
      expect(screen.getByText('Translations exceeding limit.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ok-button'));
  });
});

describe('copy interactive message', () => {
  test('it renders copy interactive quick reply message', async () => {
    mockUseLocationValue.state = 'copy';

    const { getByText, getAllByTestId } = render(renderInteractiveMessage('1', getTemplateMocks1));
    // vi.spyOn(axios, 'get').mockResolvedValueOnce(responseMock1);

    await waitFor(() => {
      expect(getByText('Copy Interactive Message')).toBeInTheDocument();
      const input = getAllByTestId('input');
      expect(input[0]?.querySelector('input')).toHaveValue('Copy of Are you excited for *Glific*?');
    });
  });
});

test('it uploads a file successfully', async () => {
  const uploadUrl = 'https://storage.example.com/test-image.png';

  const uploadMock = {
    request: { query: UPLOAD_MEDIA },
    newData: () => Promise.resolve({ data: { uploadMedia: uploadUrl } }),
  };

  render(interactiveMessage([uploadMock]));

  const autos = await screen.findAllByRole('combobox');
  expect(autos.length).toBeGreaterThan(1);

  fireEvent.mouseDown(autos[1]);
  const uploadOption = await screen.findByRole('option', { name: /upload attachment/i });
  await userEvent.click(uploadOption);

  const mockFile = new File(['dummy content'], 'test-image.png', { type: 'image/png' });

  const origClick = HTMLInputElement.prototype.click;
  HTMLInputElement.prototype.click = function patchedClick(this: HTMLInputElement) {
    if (this.type === 'file') {
      const fileList = {
        0: mockFile,
        length: 1,
        item: (i: number) => (i === 0 ? mockFile : null),
      } as unknown as FileList;

      Object.defineProperty(this, 'files', { configurable: true, get: () => fileList });
      this.dispatchEvent(new Event('input', { bubbles: true }));
      this.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    return origClick.call(this);
  };

  const origPicker = (window as any).showOpenFilePicker;
  (window as any).showOpenFilePicker = async () => [{ getFile: async () => mockFile }];

  await waitFor(
    () => {
      expect(setNotification).toHaveBeenCalled();
    },
    { timeout: 3000 }
  );

  HTMLInputElement.prototype.click = origClick;
  (window as any).showOpenFilePicker = origPicker;
});
