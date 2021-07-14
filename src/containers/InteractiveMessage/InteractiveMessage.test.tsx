import { render, cleanup, screen, waitFor, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import axios from 'axios';

import { setUserSession } from '../../services/AuthService';
import { InteractiveMessage } from './InteractiveMessage';
import { mocks } from '../../mocks/InteractiveMessage';

afterEach(cleanup);
setUserSession(JSON.stringify({ organization: { id: '1' }, roles: ['Admin'] }));

jest.mock('axios', () => {
  return {
    get: jest.fn(),
  };
});

jest.setTimeout(10000);

const responseMock1 = {
  results: [{ key: 'key 1' }, { key: 'key 2' }],
};

const responseMock2 = {
  types: [{ name: 'contact', properties: [{ key: 'key 1' }, { key: 'key 2' }] }],
};

const axiosApiCall = async () => {
  axios.get.mockImplementationOnce(() => Promise.resolve({ data: responseMock1 }));

  axios.get.mockImplementationOnce(() => Promise.resolve({ data: responseMock2 }));
};

const whenStable = async () => {
  await waitFor(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

test('it renders empty interactive form', async () => {
  axiosApiCall();

  render(
    <MockedProvider mocks={[...mocks]} addTypename={false}>
      <InteractiveMessage match={{ params: {} }} />
    </MockedProvider>
  );

  // Getting contact variables
  jest.spyOn(axios, 'get').mockResolvedValueOnce(responseMock1);
  await whenStable();

  // Adding another quick reply button

  const addQuickReplyButton = screen.getByText('Add quick reply');
  expect(addQuickReplyButton).toBeInTheDocument();
  fireEvent.click(addQuickReplyButton);

  await waitFor(() => {});

  // Get all input elements
  const [title, quickReply1, quickReply2, attachmentType, attachmentUrl] =
    screen.getAllByRole('textbox');
  expect(title).toBeInTheDocument();
  expect(quickReply1).toBeInTheDocument();
  expect(quickReply2).toBeInTheDocument();
  expect(attachmentType).toBeInTheDocument();
  expect(attachmentUrl).toBeInTheDocument();

  fireEvent.change(title, { target: { value: 'new title' } });
  fireEvent.blur(title);
  await waitFor(() => {});

  fireEvent.change(quickReply1, { target: { value: 'Yes' } });
  await waitFor(() => {});
  fireEvent.change(quickReply2, { target: { value: 'No' } });
  await waitFor(() => {});

  const autoComplete = screen.getByTestId('autocomplete-element');
  fireEvent.click(autoComplete);
  fireEvent.keyDown(autoComplete);

  fireEvent.change(attachmentUrl, { target: { value: 'https://picsum.photos/200/300' } });
  fireEvent.blur(attachmentUrl);
  await waitFor(() => {});

  // Switiching between radio buttons
  const [quickReplyRadio, listRadio] = screen.getAllByRole('radio');
  expect(quickReplyRadio).toBeInTheDocument();
  expect(listRadio).toBeInTheDocument();

  fireEvent.click(listRadio);
  await waitFor(() => {});

  // Adding list data
  const [, header, listTitle, listDesc] = screen.getAllByRole('textbox');
  expect(header).toBeInTheDocument();
  expect(listTitle).toBeInTheDocument();
  expect(listDesc).toBeInTheDocument();

  fireEvent.change(header, { target: { value: 'Section 1' } });
  fireEvent.blur(header);
  await waitFor(() => {});
  fireEvent.change(listTitle, { target: { value: 'title' } });
  await waitFor(() => {});
  fireEvent.change(listDesc, { target: { value: 'desc' } });
  await waitFor(() => {});

  // Adding another list item
  const addAnotherListItemButton = screen.getByText('Add another list item');
  expect(addAnotherListItemButton);
  fireEvent.click(addAnotherListItemButton);
  await waitFor(() => {});

  // Adding another list
  const addAnotherListButton = screen.getByText('Add another list');
  expect(addAnotherListButton);
  fireEvent.click(addAnotherListButton);
  await waitFor(() => {});

  // Deleting list
  const deleteListButton = screen.getByText('Dark.svg');
  expect(deleteListButton).toBeInTheDocument();
  fireEvent.click(deleteListButton);
  await waitFor(() => {});

  // Deleting list item
  const deleteListItemButton = screen.getByText('Cross.svg');
  expect(deleteListItemButton).toBeInTheDocument();
  fireEvent.click(deleteListItemButton);
  await waitFor(() => {});

  // Switching back to quick reply radio
  fireEvent.click(quickReplyRadio);
  await waitFor(() => {});

  const saveButton = screen.getByText('Save');
  expect(saveButton).toBeInTheDocument();
  fireEvent.click(saveButton);
  await waitFor(() => {});
});

test('it renders empty interactive form in edit mode', async () => {
  axiosApiCall();

  render(
    <MockedProvider mocks={[...mocks]} addTypename={false}>
      <InteractiveMessage match={{ params: { id: '2' } }} />
    </MockedProvider>
  );

  jest.spyOn(axios, 'get').mockResolvedValueOnce(responseMock1);
  await whenStable();

  const saveButton = screen.getByText('Save');
  expect(saveButton).toBeInTheDocument();
  fireEvent.click(saveButton);
  await waitFor(() => {});
});
