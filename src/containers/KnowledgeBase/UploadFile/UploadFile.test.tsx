import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { categoryMocks } from 'mocks/KnowledgeBase';
import { MemoryRouter } from 'react-router';
import { UploadFile } from './UploadFile';

const defaultProps = {
  setFile: vi.fn(),
  setCategory: vi.fn(),
  file: null,
  category: null,
};

const wrapper = (
  <MockedProvider mocks={categoryMocks} addTypename={false}>
    <MemoryRouter>
      <UploadFile {...defaultProps} />
    </MemoryRouter>
  </MockedProvider>
);

test('it creates new category', async () => {
  const { getByText, getByTestId } = render(wrapper);

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Upload File')).toBeInTheDocument();
  });

  const categoryDropDown = screen.getByRole('combobox');

  categoryDropDown.focus();
  fireEvent.keyDown(categoryDropDown, { key: 'ArrowDown' });
  fireEvent.change(categoryDropDown, { target: { value: 'Support2' } });
  fireEvent.keyDown(categoryDropDown, { key: 'ArrowDown' });
  fireEvent.keyDown(categoryDropDown, { key: 'Enter' });
});

test('shows errors for invalid file', async () => {
  const { getByText, getByTestId } = render(wrapper);
  const content = (size: number) => new Blob([new Array(size).fill(' ').join('')]);
  const mockFile = (type: string, size: number) => new File([content(size)], 'file.pdf', { type });

  expect(getByTestId('loading')).toBeInTheDocument();

  await waitFor(() => {
    expect(getByText('Upload File')).toBeInTheDocument();
  });

  fireEvent.change(screen.getByTestId('uploadFile'), {
    target: {
      files: [mockFile('application/pdf', 1700000)],
    },
  });

  await waitFor(() => {
    expect(screen.getAllByText('File size should be less than 20MB')[0]).toBeInTheDocument();
  });

  fireEvent.change(screen.getByTestId('uploadFile'), {
    target: {
      files: [mockFile('image/png', 1024)],
    },
  });

  await waitFor(() => {
    expect(screen.getAllByText('File type should be PDF')[0]).toBeInTheDocument();
  });
});
