import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as Notification from 'common/notification';
import {
  MOCKS,
  addFilesToFileSearchWithErrorMocks,
  cloneCompletedMocks,
  cloneErrorMocks,
  cloneFailedMocks,
  clonePendingMocks,
  emptyMocks,
  errorMocks,
  legacyVectorStoreMocks,
  loadMoreMocks,
  newVersionInProgressMocks,
  unknownModelMocks,
  uploadSupportedFileMocks,
} from 'mocks/Assistants';
import { MemoryRouter, Route, Routes } from 'react-router';
import Assistants from './Assistants';

const notificationSpy = vi.spyOn(Notification, 'setNotification');
const errorMessageSpy = vi.spyOn(Notification, 'setErrorMessage');

beforeEach(() => {
  vi.clearAllMocks();
});

const assistantsComponent = (mocks: any = MOCKS) => (
  <MockedProvider mocks={mocks}>
    <MemoryRouter initialEntries={['/assistants']}>
      <Routes>
        <Route path="/assistants/add" element={<Assistants />} />
        <Route path="/assistants" element={<Assistants />} />
        <Route path="/assistants/:assistantId" element={<Assistants />} />
      </Routes>
    </MemoryRouter>
  </MockedProvider>
);

test('should show empty text when no assistants are found', async () => {
  render(assistantsComponent(emptyMocks));

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.getByText('No assistants found!')).toBeInTheDocument;
  });
});

test('it renders the list properly and switches between items', async () => {
  render(assistantsComponent());

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getAllByTestId('listItem')).toHaveLength(3);
  });

  fireEvent.click(screen.getAllByTestId('listItem')[1]);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('VectorStore-77ae3597')).toBeInTheDocument();
  });
});

test('it creates an assistant', async () => {
  render(assistantsComponent(uploadSupportedFileMocks));

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('headingButton'));

  await waitFor(() => {
    expect(screen.getByText('Instructions (Prompt)*')).toBeInTheDocument();
  });

  const autocompletes = screen.getAllByTestId('AutocompleteInput');
  const inputs = screen.getAllByRole('textbox');

  fireEvent.change(inputs[1], { target: { value: 'test name' } });
  fireEvent.change(inputs[2], { target: { value: 'test instructions' } });
  fireEvent.change(screen.getByRole('sliderDisplay'), { target: { value: 1.5 } });

  fireEvent.click(autocompletes[0], { key: 'Enter' });
  autocompletes[0].focus();
  fireEvent.keyDown(autocompletes[0], { key: 'ArrowDown' });
  fireEvent.click(screen.getByText('gpt-4o-mini'), { key: 'Enter' });

  fireEvent.click(screen.getByTestId('addFiles'));
  await waitFor(() => {
    expect(screen.getByTestId('dialogTitle')).toHaveTextContent('Manage Knowledge Base');
  });
  fireEvent.click(screen.getByTestId('ok-button'));

  fireEvent.click(screen.getByTestId('addFiles'));

  const mockFile = new File(['file content'], 'testFile.txt', { type: 'text/plain' });

  fireEvent.change(screen.getByTestId('uploadFile'), { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(screen.getAllByTestId('fileItem')).toHaveLength(1);
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(screen.queryByTestId('dialogBox')).not.toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('1 file')).toBeInTheDocument();
  });

  fireEvent.change(inputs[3], { target: { value: 'description for new changes' } });

  fireEvent.click(screen.getByTestId('submitAction'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('Assistant created successfully', 'success');
  });
});

test('it loads more assistants', async () => {
  render(assistantsComponent(loadMoreMocks));

  await waitFor(() => {
    expect(screen.getAllByTestId('listItem')).toHaveLength(25);
  });

  fireEvent.click(screen.getByTestId('loadmore'));

  await waitFor(() => {
    expect(screen.getAllByTestId('listItem')).toHaveLength(25);
  });
});

test('it searchs for an assistant', async () => {
  render(assistantsComponent());

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'testAssistant' } });
  fireEvent.click(screen.getByTestId('CloseIcon'));

  fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'testAssistant' } });

  await waitFor(() => {
    expect(screen.getByText('testAssistant')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('copyItemId'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});

test('it uploads files to assistant', async () => {
  render(assistantsComponent(uploadSupportedFileMocks));

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('addFiles'));
  });

  fireEvent.click(screen.getByTestId('addFiles'));
  fireEvent.click(screen.getByTestId('cancel-button'));

  fireEvent.click(screen.getByTestId('addFiles'));
  await waitFor(() => {
    expect(screen.getByTestId('dialogTitle')).toHaveTextContent('Manage Knowledge Base');
  });
  fireEvent.click(screen.getByTestId('ok-button'));

  fireEvent.click(screen.getByTestId('addFiles'));

  const mockFile = new File(['file content'], 'testFile.txt', { type: 'text/plain' });
  const mockFileContent = new Blob([new Array(28000000).fill('a').join('')], {
    type: 'text/plain',
  });

  const mockFileBiggerThan20MB = new File([mockFileContent], 'testFile2.txt', {
    type: 'text/plain',
  });
  const fileInput = screen.getByTestId('uploadFile');
  fireEvent.change(fileInput, { target: { files: [] } });
  fireEvent.change(fileInput, { target: { files: [mockFile] } });
  fireEvent.change(fileInput, { target: { files: [mockFile] } });
  fireEvent.click(screen.getAllByTestId('deleteFile')[0]);

  await waitFor(() => {
    expect(screen.queryByText('testFile.txt')).not.toBeInTheDocument();
  });

  fireEvent.change(fileInput, { target: { files: [mockFileBiggerThan20MB] } });

  //shows error message for larger files
  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('testFile2.txt is above 20MB', 'warning');
  });

  fireEvent.change(fileInput, { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(screen.getAllByTestId('fileItem').length).toBeGreaterThanOrEqual(2);
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});

test('it shows error when adding files to assistant fails', async () => {
  render(assistantsComponent(addFilesToFileSearchWithErrorMocks));

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('addFiles'));
  });

  fireEvent.click(screen.getByTestId('addFiles'));
  const mockFile = new File(['file content'], 'testFile.txt', { type: 'text/plain' });

  const fileInput = screen.getByTestId('uploadFile');
  fireEvent.change(fileInput, { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(screen.getAllByTestId('fileItem').length).toBeGreaterThanOrEqual(2);
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
  });
});

test('it updates the assistant', async () => {
  render(assistantsComponent());

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByText('Instructions (Prompt)*')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('copyCurrentAssistantId'));

  const autocompletes = screen.getAllByTestId('AutocompleteInput');
  const inputs = screen.getAllByRole('textbox');

  autocompletes[0].focus();
  fireEvent.keyDown(autocompletes[0], { key: 'ArrowDown' });

  fireEvent.click(screen.getByText('gpt-4o-mini'), { key: 'Enter' });

  fireEvent.change(inputs[1], { target: { value: 'test name' } });
  fireEvent.change(inputs[2], { target: { value: 'test instructions' } });
  fireEvent.change(screen.getByRole('sliderDisplay'), { target: { value: 1.5 } });

  fireEvent.click(screen.getByTestId('submitAction'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});

test('it deletes the assistant', async () => {
  render(assistantsComponent());

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByText('Instructions (Prompt)*')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('removeAssistant'));
  fireEvent.click(screen.getByTestId('cancel-button'));

  fireEvent.click(screen.getByTestId('removeAssistant'));

  await waitFor(() => {
    expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});

test('it should show errors for invalid value in temperature', async () => {
  render(assistantsComponent());

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByText('Instructions (Prompt)*')).toBeInTheDocument();
  });

  fireEvent.change(screen.getByRole('sliderDisplay'), { target: { value: 2.5 } });

  await waitFor(() => {
    expect(screen.getByText('Temperature value should be between 0-2')).toBeInTheDocument();
  });

  fireEvent.change(screen.getByRole('sliderDisplay'), { target: { value: -2.5 } });

  await waitFor(() => {
    expect(screen.getByText('Temperature value should be between 0-2')).toBeInTheDocument();
  });
});

test('it opens the instruction dialog box', async () => {
  render(assistantsComponent());

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('expandIcon')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('expandIcon'));
  fireEvent.click(screen.getByTestId('cancel-button'));
  fireEvent.click(screen.getByTestId('expandIcon'));

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test instructions' } });
  fireEvent.click(screen.getByTestId('save-button'));

  await waitFor(() => {
    expect(screen.getByText('test instructions')).toBeInTheDocument();
  });
});

test('it shows read-only note and hides upload for legacy vector store', async () => {
  render(assistantsComponent(legacyVectorStoreMocks));

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByText('Knowledge Base Files *')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('addFiles'));

  await waitFor(() => {
    expect(screen.getByTestId('readOnlyNote')).toBeInTheDocument();
  });

  expect(screen.queryByTestId('uploadFile')).not.toBeInTheDocument();
  expect(screen.queryByTestId('deleteFile')).not.toBeInTheDocument();
});

test('it shows version in progress indicator when newVersionInProgress is true', async () => {
  render(assistantsComponent(newVersionInProgressMocks));

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('versionInProgress')).toBeInTheDocument();
    expect(screen.getByText('A new version is being created')).toBeInTheDocument();
  });
});

test('uploading multiple files and error messages', async () => {
  render(assistantsComponent(errorMocks));

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('addFiles'));
  });

  fireEvent.click(screen.getByTestId('addFiles'));
  fireEvent.click(screen.getByTestId('cancel-button'));

  fireEvent.click(screen.getByTestId('addFiles'));
  await waitFor(() => {
    expect(screen.getByTestId('dialogTitle')).toHaveTextContent('Manage Knowledge Base');
  });
  expect(screen.getAllByTestId('fileItem')).toHaveLength(1);

  const mockFile = new File(['file content'], 'testFile.txt', { type: 'text/plain' });
  const mockFileCSV = new File(['file content'], 'testFile.csv', { type: 'text/csv' });

  const mockFileContent = new Blob([new Array(28000000).fill('a').join('')], {
    type: 'text/plain',
  });
  const mockFileBiggerThan20MB = new File([mockFileContent], 'testFile2.txt', {
    type: 'text/plain',
  });

  const fileInput = screen.getByTestId('uploadFile');
  fireEvent.change(fileInput, { target: { files: [] } });
  fireEvent.change(fileInput, { target: { files: [mockFile, mockFileBiggerThan20MB, mockFileCSV] } });

  //shows error message for larger files
  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('testFile2.txt is above 20MB', 'warning');
  });

  //no files should be uploaded as input does not allow csv files to be selected
  await waitFor(() => {
    expect(screen.queryByText('testFile.csv')).not.toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('ok-button'));
});

test("it shows indicator for unsaved changes when there are changes in the assistant's prompt or settings", async () => {
  render(assistantsComponent());

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByText('Instructions (Prompt)*')).toBeInTheDocument();
  });

  const inputs = screen.getAllByRole('textbox');

  fireEvent.change(inputs[2], { target: { value: 'test instructions' } });

  await waitFor(() => {
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });
});

test('it shows knowledge base required warning when submitting without a knowledge base', async () => {
  render(assistantsComponent(MOCKS));

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('headingButton'));

  await waitFor(() => {
    expect(screen.getByText('Instructions (Prompt)*')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('submitAction'));

  await waitFor(() => {
    expect(screen.getByText('Knowledge base is required. Please upload files first.')).toBeInTheDocument();
  });
});

test('it clears the knowledge base required warning after knowledge base is created', async () => {
  render(assistantsComponent(uploadSupportedFileMocks));

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('headingButton'));

  await waitFor(() => {
    expect(screen.getByText('Instructions (Prompt)*')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('submitAction'));

  await waitFor(() => {
    expect(screen.getByText('Knowledge base is required. Please upload files first.')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('addFiles'));

  const mockFile = new File(['file content'], 'testFile.txt', { type: 'text/plain' });
  fireEvent.change(screen.getByTestId('uploadFile'), { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(screen.getAllByTestId('fileItem')).toHaveLength(1);
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  fireEvent.click(screen.getByTestId('submitAction'));

  await waitFor(() => {
    expect(screen.queryByText('Knowledge base is required. Please upload files first.')).not.toBeInTheDocument();
  });
});

test('it displays assistant status in the list', async () => {
  render(assistantsComponent());

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  const statusBadges = screen.getAllByTestId('assistantStatus');
  expect(statusBadges.length).toBeGreaterThan(0);
  expect(statusBadges[0]).toHaveTextContent('Ready');
});

test('it displays a model returned from backend that is not in the hardcoded list', async () => {
  render(assistantsComponent(unknownModelMocks));

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByText('Instructions (Prompt)*')).toBeInTheDocument();
  });

  const autocompletes = screen.getAllByTestId('AutocompleteInput');
  expect(autocompletes[0].querySelector('input')).toHaveValue('o3-mini');
});

test('closing a knowledge base dialog with no files should revert to the original files', async () => {
  render(assistantsComponent());

  await waitFor(() => {
    expect(screen.getByText('AI Assistants')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('addFiles'));
  });

  fireEvent.click(screen.getByTestId('addFiles'));

  await waitFor(() => {
    expect(screen.getAllByTestId('fileItem')).toHaveLength(1);
  });

  fireEvent.click(screen.getByTestId('deleteFile'));

  // ok button should be disabled and file list should be empty after deleting the only file present
  await waitFor(() => {
    expect(screen.queryAllByTestId('fileItem')).toHaveLength(0);
    expect(screen.getByTestId('ok-button')).toBeDisabled();
  });

  fireEvent.click(screen.getByTestId('cancel-button'));

  // dialog should be closed and original file should still be present
  fireEvent.click(screen.getByTestId('addFiles'));

  await waitFor(() => {
    expect(screen.getAllByTestId('fileItem')).toHaveLength(1);
  });
});

test('it shows Clone Assistant button when cloneStatus is pending', async () => {
  render(assistantsComponent(clonePendingMocks));

  await waitFor(() => {
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('cloneAssistant')).toBeInTheDocument();
    expect(screen.getByTestId('cloneAssistant')).toHaveTextContent('Clone Assistant');
    expect(screen.getByTestId('cloneAssistant')).not.toBeDisabled();
  });
});

test('it shows confirmation dialog and initiates cloning on proceed', async () => {
  render(assistantsComponent(clonePendingMocks));

  await waitFor(() => {
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('cloneAssistant')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('cloneAssistant'));

  await waitFor(() => {
    expect(screen.getByText('Cloning May Affect Responses')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('Assistant clone initiated');
  });
});

test('it cancels clone confirmation dialog', async () => {
  render(assistantsComponent(clonePendingMocks));

  await waitFor(() => {
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('cloneAssistant')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('cloneAssistant'));

  await waitFor(() => {
    expect(screen.getByText('Cloning May Affect Responses')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('cancel-button'));

  await waitFor(() => {
    expect(screen.queryByText('Cloning May Affect Responses')).not.toBeInTheDocument();
  });
});

test('it shows disabled Clone Assistant button when cloneStatus is completed', async () => {
  render(assistantsComponent(cloneCompletedMocks));

  await waitFor(() => {
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('cloneAssistant')).toBeInTheDocument();
    expect(screen.getByTestId('cloneAssistant')).toBeDisabled();
    expect(screen.getByTestId('cloneAssistant')).toHaveTextContent('Clone Assistant');
  });
});

test('it shows Retry cloning button when cloneStatus is failed', async () => {
  render(assistantsComponent(cloneFailedMocks));

  await waitFor(() => {
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('cloneAssistant')).toBeInTheDocument();
    expect(screen.getByTestId('cloneAssistant')).toHaveTextContent('Retry cloning');
    expect(screen.getByTestId('cloneAssistant')).not.toBeDisabled();
  });
});

test('it does not show clone button when cloneStatus is none', async () => {
  render(assistantsComponent());

  await waitFor(() => {
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByText('Instructions (Prompt)*')).toBeInTheDocument();
  });

  expect(screen.queryByTestId('cloneAssistant')).not.toBeInTheDocument();
});

test('it shows error when clone mutation fails', async () => {
  render(assistantsComponent(cloneErrorMocks));

  await waitFor(() => {
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[0]);

  await waitFor(() => {
    expect(screen.getByTestId('cloneAssistant')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('cloneAssistant'));

  await waitFor(() => {
    expect(screen.getByText('Cloning May Affect Responses')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(errorMessageSpy).toHaveBeenCalled();
  });
});
