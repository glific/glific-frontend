import { render, fireEvent, screen, getByRole, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import { SearchDialogBox } from './SearchDialogBox';
import * as AutoComplete from '../Form/AutoComplete/AutoComplete';

const mockHandleOk = vi.fn();
const mockHandleCancel = vi.fn();
const mockHandleChange = vi.fn();
const defaultProps: any = {
  title: 'Search Box',
  handleOk: mockHandleOk,
  handleCancel: mockHandleCancel,
  onChange: mockHandleChange,
  options: [{ id: '1', label: 'something' }],
  selectedOptions: ['1'],
  multiple: false,
};

const asyncSearchProps = {
  ...defaultProps,
  icon: null,
  optionLabel: 'label',
  options: [{ id: '1', label: 'something' }],
  selectedOptions: [{ id: '1', label: 'something' }],
  asyncSearch: true,
};

const searchDialog = (props = defaultProps) => (
  <MockedProvider>
    <SearchDialogBox {...props} />
  </MockedProvider>
);

test('it should render the title correctly', () => {
  const { getByTestId } = render(searchDialog());
  expect(getByTestId('dialogTitle')).toHaveTextContent('Search Box');
});

test('it should contain the selected option', async () => {
  const { getByRole } = render(searchDialog());
  const [interactiveType] = screen.getAllByTestId('autocomplete-element');
  interactiveType.focus();
  fireEvent.keyDown(interactiveType, { key: 'ArrowDown' });
  fireEvent.keyDown(interactiveType, { key: 'Enter' });

  await waitFor(() => {
    expect(getByRole('option')).toHaveTextContent('something');
  });
});

test('save with normal props', () => {
  const { getByText } = render(searchDialog(defaultProps));
  fireEvent.click(getByText('Save'));
  // need assertions here
});

test('save with async prop', () => {
  const { getByText } = render(searchDialog(asyncSearchProps));
  fireEvent.click(getByText('Save'));
  // need assertions here
});

test('change value in dialog box', async () => {
  render(searchDialog(defaultProps));
  const [interactiveType] = screen.getAllByTestId('autocomplete-element');
  interactiveType.focus();
  fireEvent.keyDown(interactiveType, { key: 'ArrowDown' });
  fireEvent.keyDown(interactiveType, { key: 'Enter' });

  await waitFor(() => {
    expect(screen.getByRole('option')).toHaveTextContent('something');
  });
});
