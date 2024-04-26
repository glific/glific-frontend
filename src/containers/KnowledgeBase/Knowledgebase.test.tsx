import { MockedProvider } from '@apollo/client/testing';
import KnowledgeBase from './KnowledgeBase';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { knowledgeBaseMocks } from 'mocks/KnowledgeBase';
import { MemoryRouter } from 'react-router';
import * as utils from 'common/utils';
import * as notification from 'common/notification';

const wrapper = (
  <MockedProvider mocks={knowledgeBaseMocks} addTypename={false}>
    <MemoryRouter>
      <KnowledgeBase />
    </MemoryRouter>
  </MockedProvider>
);

test('KnowledgeBase component renders', async () => {
  const { getByText, getByTestId } = render(wrapper);

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Knowledge base')).toBeInTheDocument();
    expect(getByText('Document1.pdf')).toBeInTheDocument();
  });
});

test('It copies the category id.', async () => {
  const { getByText, getByTestId, getAllByTestId } = render(wrapper);
  const copyToClipboardSpy = vi.spyOn(utils, 'copyToClipboard');

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Knowledge base')).toBeInTheDocument();
  });

  fireEvent.click(getAllByTestId('copy-icon')[0]);

  await waitFor(() => {
    expect(copyToClipboardSpy).toHaveBeenCalled();
  });
});

test('It deletes the knowledge base and closes the dialog box', async () => {
  const { getByText, getByTestId, getAllByTestId } = render(wrapper);
  const notificationSpy = vi.spyOn(notification, 'setNotification');

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Knowledge base')).toBeInTheDocument();
  });

  fireEvent.click(getAllByTestId('delete-icon')[0]);

  const dialog = screen.getByTestId('delete-dialog');

  await waitFor(() => {
    expect(dialog).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });

  fireEvent.click(getAllByTestId('delete-icon')[0]);
  fireEvent.click(getByTestId('cancel-button'));

  await waitFor(() => {
    expect(dialog).not.toBeInTheDocument();
  });
});

test('It opens and closes upload dialog box', async () => {
  const { getByText, getByTestId } = render(wrapper);

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Knowledge base')).toBeInTheDocument();
  });

  fireEvent.click(getByTestId('newItemButton'));

  const dialog = screen.getByTestId('upload-dialog');

  await waitFor(() => {
    expect(dialog).toBeInTheDocument();
  });

  fireEvent.click(getByTestId('cancel-button'));

  await waitFor(() => {
    expect(dialog).not.toBeInTheDocument();
  });
});

test('it uploads the file', async () => {
  const { getByTestId } = render(wrapper);
  const notificationSpy = vi.spyOn(notification, 'setNotification');

  expect(getByTestId('loading')).toBeInTheDocument();

  fireEvent.click(getByTestId('newItemButton'));

  await waitFor(() => {
    expect(screen.getByText('Upload File')).toBeInTheDocument();
  });

  const categoryDropDown = screen.getByRole('combobox');

  categoryDropDown.focus();
  fireEvent.keyDown(categoryDropDown, { key: 'ArrowDown' });
  fireEvent.keyDown(categoryDropDown, { key: 'ArrowDown' });
  fireEvent.keyDown(categoryDropDown, { key: 'Enter' });

  fireEvent.change(screen.getByTestId('uploadFile'), {
    target: {
      files: [new File(['(⌐□_□)'], 'file.pdf', { type: 'application/pdf' })],
    },
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});
