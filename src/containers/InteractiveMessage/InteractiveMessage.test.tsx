import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';
import { Route, MemoryRouter, Routes } from 'react-router';
import { vi } from 'vitest';

import { setUserSession } from 'services/AuthService';
import {
  createCustomUiMock,
  getTemplateMocks1,
  getTemplateMocks2,
  getTemplateMocks3,
  getTemplateMocks4,
  getTemplateMocks5,
  getTemplateMocks6,
  mocks,
  translateInteractiveTemplateMock,
  translateWitTrimmingMocks,
  translateWithoutTrimmingMocks,
} from 'mocks/InteractiveMessage';
import { InteractiveMessage } from './InteractiveMessage';
import { validator } from './InteractiveMessage.helper';
import { getPresetPayload } from './CustomUi.helper';
import { CUSTOM_UI } from 'common/constants';
import * as Yup from 'yup';
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

vi.mock('services/AuthService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('services/AuthService')>();
  return {
    ...actual,
    getOrganizationServices: vi.fn((service: string) => {
      if (service === 'googleCloudStorage') {
        return true;
      }
      return false;
    }),
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
      expect(getByText('Create a new Interactive message')).toBeInTheDocument();
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
      expect(screen.getByText('Create a new Interactive message')).toBeInTheDocument();
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

describe('Custom UI type', () => {
  // The type picker lists Reply buttons / List message / Location request / Custom UI.
  const selectCustomUiType = async () => {
    await waitFor(() => {
      expect(screen.getByText('Create a new Interactive message')).toBeInTheDocument();
    });

    const [interactiveType] = screen.getAllByTestId('autocomplete-element');
    interactiveType.focus();
    for (let i = 0; i < 4; i += 1) {
      fireEvent.keyDown(interactiveType, { key: 'ArrowDown' });
    }
    fireEvent.keyDown(interactiveType, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByTestId('customUiEditor')).toBeInTheDocument();
    });
  };

  test('groups the type picker by derived channel compatibility and hints that flows go web-only', async () => {
    render(interactiveMessage());
    await selectCustomUiType();

    expect(
      screen.getByText(
        'Custom UI messages are delivered on the web channel only. A flow that uses one becomes web-only — WhatsApp contacts will receive the fallback text as a plain message instead.'
      )
    ).toBeInTheDocument();

    const [interactiveType] = screen.getAllByTestId('autocomplete-element');
    interactiveType.focus();
    fireEvent.keyDown(interactiveType, { key: 'ArrowDown' });

    await waitFor(() => {
      expect(screen.getByText('Web + WhatsApp')).toBeInTheDocument();
      expect(screen.getAllByText('Web only').length).toBeGreaterThan(0);
    });
  });

  test('pre-fills a valid image panel payload and fallback, and saves the contract envelope', async () => {
    let captured: any = null;
    render(interactiveMessage([createCustomUiMock((variables: any) => (captured = variables))]));

    await selectCustomUiType();

    // the default preset seeds a payload that is already valid
    expect(screen.queryByTestId('customUiPayloadErrors')).not.toBeInTheDocument();
    expect(screen.getByTestId('customUiPayloadSize')).toHaveTextContent('of 64 KB');

    const payloadInput = screen.getByTestId('customUiPayloadTextarea') as HTMLTextAreaElement;
    expect(JSON.parse(payloadInput.value).component).toBe('glific/image_panel');

    // the simulator preview shows the same generic card the inbox uses
    await waitFor(() => {
      expect(screen.getByTestId('customUiCard')).toBeInTheDocument();
    });
    expect(screen.getByTestId('customUiHeader')).toHaveTextContent('Interactive · glific/image_panel');

    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Course picker' } });
    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(captured).not.toBeNull();
    });

    expect(captured.input.type).toBe('CUSTOM_UI');
    expect(captured.input.label).toBe('Course picker');

    const envelope = JSON.parse(captured.input.interactiveContent);
    // contract §2 — `type` inside the payload is what the backend keys off
    expect(Object.keys(envelope)).toEqual(['type', 'version', 'component', 'props', 'fallback']);
    expect(envelope.type).toBe('custom_ui');
    expect(envelope.version).toBe('1');
    expect(envelope.component).toBe('glific/image_panel');
    expect(envelope.props.options).toHaveLength(2);
    expect(envelope.fallback).toBe('Pick a course: Spoken English or Digital skills');

    // the translation for the authoring language carries the same envelope
    expect(JSON.parse(captured.input.translations)['1'].fallback).toBe(envelope.fallback);
  });

  test('switching preset to Form swaps the payload and the suggested fallback', async () => {
    render(interactiveMessage());
    await selectCustomUiType();

    const presetPicker = screen.getAllByTestId('autocomplete-element')[1];
    presetPicker.focus();
    fireEvent.keyDown(presetPicker, { key: 'ArrowDown' });
    fireEvent.keyDown(presetPicker, { key: 'ArrowDown' });
    fireEvent.keyDown(presetPicker, { key: 'ArrowDown' });
    fireEvent.keyDown(presetPicker, { key: 'Enter' });

    await waitFor(() => {
      const payloadInput = screen.getByTestId('customUiPayloadTextarea') as HTMLTextAreaElement;
      expect(JSON.parse(payloadInput.value).component).toBe('glific/form');
    });
    expect(screen.queryByTestId('customUiPayloadErrors')).not.toBeInTheDocument();
  });

  test('rejects an unknown name in the reserved glific namespace', async () => {
    let captured: any = null;
    render(interactiveMessage([createCustomUiMock((variables: any) => (captured = variables))]));

    await selectCustomUiType();

    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Course picker' } });
    fireEvent.change(screen.getByTestId('customUiPayloadTextarea'), {
      target: { value: JSON.stringify({ component: 'glific/foo', props: {} }) },
    });

    await waitFor(() => {
      expect(screen.getByTestId('customUiPayloadErrors')).toHaveTextContent('glific/ namespace is reserved');
    });

    fireEvent.click(screen.getByTestId('submitActionButton'));

    await waitFor(() => {
      expect(setNotification).toHaveBeenCalled();
    });
    expect(captured).toBeNull();
  });

  test('names the offending field when a glific block is missing a prop', async () => {
    render(interactiveMessage());
    await selectCustomUiType();

    fireEvent.change(screen.getByTestId('customUiPayloadTextarea'), {
      target: {
        value: JSON.stringify({
          component: 'glific/image_panel',
          props: { id: 'course', options: [{ id: 'c1', label: 'Spoken English' }] },
        }),
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('customUiPayloadErrors')).toHaveTextContent('"props.options[0].image" is required');
    });
  });

  test('reports invalid JSON', async () => {
    render(interactiveMessage());
    await selectCustomUiType();

    fireEvent.change(screen.getByTestId('customUiPayloadTextarea'), { target: { value: '{ nope' } });

    await waitFor(() => {
      expect(screen.getByTestId('customUiPayloadErrors')).toHaveTextContent('Invalid JSON');
    });
  });

  test('requires the fallback text and the payload on every language', async () => {
    const schema = Yup.object().shape(validator(CUSTOM_UI, (text: string) => text));

    const errorsFor = async (values: any) => {
      try {
        await schema.validate(values, { abortEarly: false });
        return [];
      } catch (error: any) {
        return error.errors;
      }
    };

    expect(
      await errorsFor({ title: 'Course picker', body: '', customUiPayload: getPresetPayload('glific/form') })
    ).toContain('Fallback text is required.');

    expect(await errorsFor({ title: 'Course picker', body: 'Pick a course', customUiPayload: '' })).toContain(
      'Payload is required.'
    );

    expect(
      await errorsFor({
        title: 'Course picker',
        body: 'Pick a course',
        customUiPayload: getPresetPayload('glific/image_panel'),
      })
    ).toEqual([]);
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

  test('it preserves body bold formatting while stripping markdown from LIST item options', async () => {
    render(renderInteractiveMessage('6', getTemplateMocks6));

    await waitFor(() => {
      expect(screen.getByText('Markdown content removed')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('ok-button'));

    await waitFor(() => {
      expect(screen.getByText('Edit Interactive message')).toBeInTheDocument();
    });

    await waitFor(() => {
      const bodyEditor = screen.getByTestId('editor-body');
      expect(bodyEditor).toHaveTextContent('*bold body text*');
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
      expect(getByText('Create a new Interactive message')).toBeInTheDocument();
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
      expect(getByText('Create a new Interactive message')).toBeInTheDocument();
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

  // Now "UPLOAD ATTACHMENT" should be visible!
  const uploadOption = await screen.findByRole('option', { name: /upload attachment/i });
  await userEvent.click(uploadOption);

  const mockFile = new File(['dummy content'], 'test-image.png', { type: 'image/png' });
  const origClick = HTMLInputElement.prototype.click;
  const origPicker = (window as Window & { showOpenFilePicker?: () => Promise<FileSystemFileHandle[]> })
    .showOpenFilePicker;

  HTMLInputElement.prototype.click = function patchedClick(this: HTMLInputElement): void {
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
    origClick.call(this);
  };

  (window as Window & { showOpenFilePicker?: () => Promise<FileSystemFileHandle[]> }).showOpenFilePicker = async () => [
    {
      getFile: async () => mockFile,
    } as FileSystemFileHandle,
  ];

  await waitFor(
    () => {
      expect(setNotification).toHaveBeenCalled();
    },
    { timeout: 3000 }
  );

  HTMLInputElement.prototype.click = origClick;
  (window as Window & { showOpenFilePicker?: () => Promise<FileSystemFileHandle[]> }).showOpenFilePicker = origPicker;
});
