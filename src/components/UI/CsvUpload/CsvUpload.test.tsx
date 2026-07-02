import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { setNotification } from 'common/notification';
import { CsvUpload } from './CsvUpload';

vi.mock('common/notification', async (importOriginal) => {
  const mod = await importOriginal<typeof import('common/notification')>();
  return { ...mod, setNotification: vi.fn() };
});

const defaultProps = {
  fileName: '',
  onFileSelect: vi.fn(),
  onClear: vi.fn(),
  inputId: 'csvInput',
  inputTestId: 'csvInput',
  sampleUrl: 'https://example.com/sample.csv',
  sampleFileName: 'sample.csv',
  sampleText: 'CSV with a phone column; name optional.',
};

const renderComponent = (props: Partial<typeof defaultProps> = {}) =>
  render(<CsvUpload {...defaultProps} {...props} />);

beforeEach(() => {
  vi.clearAllMocks();
});

test('renders the upload prompt and sample link when no file is selected', () => {
  renderComponent();

  expect(screen.getByText('Upload File')).toBeInTheDocument();
  expect(screen.getByText('CSV with a phone column; name optional.')).toBeInTheDocument();

  const sample = screen.getByText('Download Sample');
  expect(sample).toHaveAttribute('href', 'https://example.com/sample.csv');
  expect(sample).toHaveAttribute('download', 'sample.csv');

  // input is enabled and there is no clear button when nothing is selected
  expect(screen.getByTestId('csvInput')).not.toBeDisabled();
  expect(screen.queryByTestId('cross-icon')).not.toBeInTheDocument();
});

test('reads a valid CSV and calls onFileSelect with its contents and name', async () => {
  const onFileSelect = vi.fn();
  renderComponent({ onFileSelect });

  const file = new File(['phone\n919900112233\n'], 'members.csv', { type: 'text/csv' });
  fireEvent.change(screen.getByTestId('csvInput'), { target: { files: [file] } });

  await waitFor(() => {
    expect(onFileSelect).toHaveBeenCalledWith('phone\n919900112233\n', 'members.csv');
  });
  expect(setNotification).not.toHaveBeenCalled();
});

test('accepts a .CSV extension regardless of case', async () => {
  const onFileSelect = vi.fn();
  renderComponent({ onFileSelect });

  const file = new File(['phone\n919900112233\n'], 'MEMBERS.CSV', { type: 'text/csv' });
  fireEvent.change(screen.getByTestId('csvInput'), { target: { files: [file] } });

  await waitFor(() => {
    expect(onFileSelect).toHaveBeenCalledWith('phone\n919900112233\n', 'MEMBERS.CSV');
  });
});

test('rejects a non-CSV file with a warning and does not read it', () => {
  const onFileSelect = vi.fn();
  renderComponent({ onFileSelect });

  const file = new File(['nope'], 'notes.txt', { type: 'text/plain' });
  fireEvent.change(screen.getByTestId('csvInput'), { target: { files: [file] } });

  expect(setNotification).toHaveBeenCalledWith('Please upload a valid CSV file', 'warning');
  expect(onFileSelect).not.toHaveBeenCalled();
});

test('rejects an extension-less file (endsWith guard)', () => {
  const onFileSelect = vi.fn();
  renderComponent({ onFileSelect });

  const file = new File(['nope'], 'members', { type: 'text/csv' });
  fireEvent.change(screen.getByTestId('csvInput'), { target: { files: [file] } });

  expect(setNotification).toHaveBeenCalledWith('Please upload a valid CSV file', 'warning');
  expect(onFileSelect).not.toHaveBeenCalled();
});

test('does nothing when the change event carries no file', () => {
  const onFileSelect = vi.fn();
  renderComponent({ onFileSelect });

  fireEvent.change(screen.getByTestId('csvInput'), { target: { files: [] } });

  expect(onFileSelect).not.toHaveBeenCalled();
  expect(setNotification).not.toHaveBeenCalled();
});

test('shows the selected file with a clear button that calls onClear and disables the input', () => {
  const onClear = vi.fn();
  renderComponent({ fileName: 'members.csv', onClear });

  expect(screen.getByText('members.csv')).toBeInTheDocument();
  expect(screen.getByTestId('csvInput')).toBeDisabled();

  fireEvent.click(screen.getByTestId('cross-icon'));
  expect(onClear).toHaveBeenCalled();
});
