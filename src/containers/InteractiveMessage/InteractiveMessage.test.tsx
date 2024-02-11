import '../../matchMediMock';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';
import { Route, MemoryRouter, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import { setUserSession } from 'services/AuthService';
import { mocks } from 'mocks/InteractiveMessage';
import { InteractiveMessage } from './InteractiveMessage';
import { FLOW_EDITOR_API } from 'config';
import { userEvent } from '@testing-library/user-event';

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
}));

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
    const addQuickReplyButton = screen.getByText('Add quick reply');
    expect(addQuickReplyButton).toBeInTheDocument();
    fireEvent.click(addQuickReplyButton);
  });

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
    const language = screen.getByText('Marathi');
    expect(language).toBeInTheDocument();

    fireEvent.click(language);
  });

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
    const addAnotherListItemButton = screen.getByText('Add another list item');
    expect(addAnotherListItemButton);
    fireEvent.click(addAnotherListItemButton);
  });

  await waitFor(() => {
    // Adding another list
    const addAnotherListButton = screen.getByText('Add another list');
    expect(addAnotherListButton);
    fireEvent.click(addAnotherListButton);
  });

  await waitFor(() => {
    // Deleting list
    const deleteListButton = screen.getByTestId('interactive-icon');
    expect(deleteListButton).toBeInTheDocument();
    fireEvent.click(deleteListButton);
  });

  await waitFor(() => {
    // Deleting list item
    const deleteListItemButton = screen.getByTestId('cross-icon');
    expect(deleteListItemButton).toBeInTheDocument();
    fireEvent.click(deleteListItemButton);
  });

  await waitFor(() => {
    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeInTheDocument();
    fireEvent.click(saveButton);
  });

  // TODOS: need to fix below
  // // succesful save
  // await waitFor(() => {
  //   expect(screen.getByText('Interactive created successfully!')).toBeInTheDocument();
  // });
});

test('it renders interactive quick reply in edit mode', async () => {
  render(renderInteractiveMessage('1'));

  // vi.spyOn(axios, 'get').mockResolvedValueOnce(responseMock1);

  await waitFor(() => {
    // Changing language to marathi to see translations
    const marathi = screen.getByText('Marathi');
    fireEvent.click(marathi);
  });

  await waitFor(() => {
    // Changing back to English
    const english = screen.getByText('English');
    fireEvent.click(english);
  });

  await waitFor(() => {
    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeInTheDocument();
    fireEvent.click(saveButton);
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
