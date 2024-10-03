import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router';
import VectorStorage from './Storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { VECTOR_STORE_MOCKS } from 'mocks/Storage';
import * as Notification from 'common/notification';

const wrapper = (
  <MockedProvider mocks={VECTOR_STORE_MOCKS}>
    <MemoryRouter>
      <VectorStorage />
    </MemoryRouter>
  </MockedProvider>
);

const notificationSpy = vi.spyOn(Notification, 'setNotification');

test('it should render Vector storage component', async () => {
  render(wrapper);

  await waitFor(() => {
    expect(screen.getByText('Vector Storage')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('Vector store 1');
  });
});

test('it should create a Vector storage', async () => {
  render(wrapper);

  await waitFor(() => {
    expect(screen.getByText('Vector Storage')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('Vector store 1');
  });

  fireEvent.click(screen.getByText('Create Storage'));

  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('Vector store created successfully!');
  });
});

test('it should switch between vector stores', async () => {
  render(wrapper);

  await waitFor(() => {
    expect(screen.getByText('Vector Storage')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('Vector store 1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getAllByTestId('listItem')[1]);

  await waitFor(() => {
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('vector_store_4');
  });
});

test('it should search for vector stores', async () => {
  render(wrapper);

  await waitFor(() => {
    expect(screen.getByText('Vector Storage')).toBeInTheDocument();
  });

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'vector_store_4' } });

  await waitFor(() => {
    expect(screen.getAllByTestId('listItem')).toHaveLength(1);
    expect(screen.getByText('vector_store_4')).toBeInTheDocument();
  });
});

test('should update name', async () => {
  render(wrapper);

  await waitFor(() => {
    expect(screen.getByText('Vector Storage')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('Vector store 1');
  });

  fireEvent.click(screen.getByTestId('editIcon'));

  fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'updated name' } });

  fireEvent.blur(screen.getAllByRole('textbox')[1]);

  await waitFor(() => {
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('updated name');
  });
});

test('should add and remove files', async () => {
  render(wrapper);

  await waitFor(() => {
    expect(screen.getByText('Vector Storage')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('Vector store 1');
  });

  fireEvent.click(screen.getByTestId('addFiles'));

  //testing if it closes the dialog box
  fireEvent.click(screen.getByTestId('cancel-button'));
  fireEvent.click(screen.getByTestId('addFiles'));

  await waitFor(() => {
    expect(screen.getByTestId('dialogBox')).toBeInTheDocument();
  });

  const mockFile = new File(['file content'], 'testFile.txt', { type: 'text/plain' });

  const fileInput = screen.getByTestId('uploadFile');
  fireEvent.change(fileInput, { target: { files: [mockFile] } });
  fireEvent.change(fileInput, { target: { files: [mockFile] } });
  fireEvent.change(fileInput, { target: { files: [mockFile] } });

  await waitFor(() => {
    expect(screen.getAllByTestId('fileItem')).toHaveLength(3);
  });

  fireEvent.click(screen.getAllByTestId('deleteFile')[1]);

  fireEvent.click(screen.getByTestId('ok-button'));

  await waitFor(() => {
    expect(screen.getAllByTestId('vectorFile')).toHaveLength(2);
  });

  fireEvent.click(screen.getAllByTestId('removeVectorFile')[1]);
});
