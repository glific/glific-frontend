import { render, fireEvent } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { vi } from 'vitest';

import { SearchDialogBox } from './SearchDialogBox';
import * as AutoComplete from '../Form/AutoComplete/AutoComplete';

const mockHandleOk = vi.fn();
const mockHandleCancel = vi.fn();
const mockHandleChange = vi.fn();
const defaultProps = {
  title: 'Search Box',
  handleOk: mockHandleOk,
  handleCancel: mockHandleCancel,
  onChange: mockHandleChange,
  options: [{ id: '1', label: 'something' }],
  selectedOptions: ['1'],
};

const asyncSearchProps = {
  ...defaultProps,
  icon: null,
  optionLabel: 'label',
  options: [{ id: '1', label: 'something' }],
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

test('it should contain the selected option', () => {
  const { getByTestId } = render(searchDialog());
  expect(getByTestId('searchChip').querySelector('span')).toHaveTextContent('something');
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

test('change value in dialog box', () => {
  const spy = vi.spyOn(AutoComplete, 'AutoComplete');
  spy.mockImplementation((props: any) => {
    const { form, onChange } = props;

    return (
      <div data-testid="searchDialogBox">
        <input
          onChange={(value) => {
            onChange(value);
            form.setFieldValue(value);
          }}
        />
      </div>
    );
  });
  const { getByTestId } = render(searchDialog(defaultProps));
  fireEvent.change(getByTestId('searchDialogBox').querySelector('input') as Element, {
    target: { value: 'change' },
  });

  // need assertions here
});
