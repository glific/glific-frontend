import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter, Route, Routes } from 'react-router';
import Assistants from './Assistants';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MOCKS, emptyMocks, loadMoreMocks } from 'mocks/Assistants';
import * as Notification from 'common/notification';

const notificationSpy = vi.spyOn(Notification, 'setNotification');
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUsedNavigate,
}));

const assistantsComponent = (mocks: any = MOCKS) => (
  <MockedProvider mocks={mocks}>
    <MemoryRouter initialEntries={['/assistants']}>
      <Routes>
        <Route path="/assistants" element={<Assistants />} />
        <Route path="/assistants/:assistantId" element={<Assistants />} />
      </Routes>
    </MemoryRouter>
  </MockedProvider>
);

test('should show empty text when no assistants are found', async () => {
  render(assistantsComponent(emptyMocks));

  await waitFor(() => {
    expect(screen.getByText('Assistants')).toBeInTheDocument();
    expect(screen.getByText('No assistants found!')).toBeInTheDocument;
  });
});

test('it renders the list properly and switches between items', async () => {
  render(assistantsComponent());

  await waitFor(() => {
    expect(screen.getByText('Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('Instructions')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getAllByTestId('listItem')).toHaveLength(3);
  });

  fireEvent.click(screen.getAllByTestId('listItem')[1]);
});

test('it creates an assistant', async () => {
  render(assistantsComponent());

  await waitFor(() => {
    expect(screen.getByText('Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('headingButton'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
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
    expect(screen.getByText('Assistants')).toBeInTheDocument();
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
  render(assistantsComponent());

  await waitFor(() => {
    expect(screen.getByText('Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
    expect(screen.getByTestId('addFiles'));
  });

  fireEvent.click(screen.getByTestId('addFiles'));
  fireEvent.click(screen.getByTestId('cancel-button'));

  fireEvent.click(screen.getByTestId('addFiles'));
  await waitFor(() => {
    expect(screen.getByText('Add files to file search')).toBeInTheDocument();
  });

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
  fireEvent.click(screen.getAllByTestId('deleteFile')[0]);

  fireEvent.change(fileInput, { target: { files: [mockFileBiggerThan20MB] } });

  //shows error message for larger files
  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });

  fireEvent.change(fileInput, { target: { files: [mockFile] } });
  fireEvent.change(fileInput, { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(screen.getAllByTestId('fileItem')).toHaveLength(2);
  });

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalled();
  });
});

test('it updates the assistant', async () => {
  render(assistantsComponent());

  await waitFor(() => {
    expect(screen.getByText('Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('Instructions')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('copyCurrentAssistantId'));

  const autocompletes = screen.getAllByTestId('AutocompleteInput');
  const inputs = screen.getAllByRole('textbox');

  autocompletes[0].focus();
  fireEvent.keyDown(autocompletes[0], { key: 'ArrowDown' });

  fireEvent.click(screen.getByText('chatgpt-4o-latest'), { key: 'Enter' });

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
    expect(screen.getByText('Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('Instructions')).toBeInTheDocument();
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
    expect(screen.getByText('Assistants')).toBeInTheDocument();
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('Instructions')).toBeInTheDocument();
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
