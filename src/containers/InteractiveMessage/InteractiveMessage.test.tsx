import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';
import { Route, MemoryRouter, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import { setUserSession } from 'services/AuthService';
import { mocks } from 'mocks/InteractiveMessage';
import { InteractiveMessage } from './InteractiveMessage';
import { FLOW_EDITOR_API } from 'config';

afterEach(() => {
  cleanup();
});

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
  render(
    <MockedProvider mocks={mockData} addTypename={false}>
      <MemoryRouter>
        <InteractiveMessage />
      </MemoryRouter>
    </MockedProvider>
  );

  // Adding another quick reply button
  await waitFor(() => {
    expect(screen.getByText('Add quick reply')).toBeInTheDocument();
  });

  const addQuickReplyButton = screen.getByText('Add quick reply');
  fireEvent.click(addQuickReplyButton);

  await waitFor(() => {
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
  });

  const [title, quickReply1, quickReply2, , attachmentUrl] = screen.getAllByRole('textbox');
  expect(title).toBeInTheDocument();
  expect(quickReply1).toBeInTheDocument();
  expect(quickReply2).toBeInTheDocument();
  expect(attachmentUrl).toBeInTheDocument();
  fireEvent.change(title, { target: { value: 'new title' } });
  fireEvent.blur(title);
  fireEvent.change(quickReply1, { target: { value: 'Yes' } });
  fireEvent.change(quickReply2, { target: { value: 'No' } });
  fireEvent.change(attachmentUrl, { target: { value: 'https://picsum.photos/200/300' } });
  fireEvent.blur(attachmentUrl);

  // Changing language to marathi
  await waitFor(() => {
    expect(screen.getByText('Marathi')).toBeInTheDocument();
  });

  const language = screen.getByText('Marathi');
  fireEvent.click(language);

  await waitFor(() => {
    const [attachmentType] = screen.getAllByTestId('autocomplete-element');

    expect(attachmentType).toBeInTheDocument();

    attachmentType.focus();
    fireEvent.keyDown(attachmentType, { key: 'ArrowDown' });
    fireEvent.keyDown(attachmentType, { key: 'Enter' });
  });

  // Switiching between radio buttons
  const [quickReplyRadio, listRadio] = screen.getAllByRole('radio');
  await waitFor(() => {
    expect(quickReplyRadio).toBeInTheDocument();
    expect(listRadio).toBeInTheDocument();
  });

  fireEvent.click(listRadio);

  await waitFor(() => {
    // Adding list data
    const [, header, listTitle, listItemTitle, listItemDesc] = screen.getAllByRole('textbox');
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

  setTimeout(async () => {
    await waitFor(() => {
      // Deleting list
      const deleteListButton = screen.getByTestId('delete-icon');
      expect(deleteListButton).toBeInTheDocument();
      fireEvent.click(deleteListButton);
    });
  }, 5000);

  await waitFor(() => {
    // Deleting list item
    const deleteListItemButton = screen.getByTestId('cross-icon');
    expect(deleteListItemButton).toBeInTheDocument();
    fireEvent.click(deleteListItemButton);
  });

  // Switching back to quick reply radio
  fireEvent.click(quickReplyRadio);

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
