import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { DropdownMenu } from './SelectMenu';

const options = [
  { id: 'a', label: 'Option A', description: 'first option', testId: 'option-a' },
  { id: 'b', label: 'Option B', endAdornment: <span>badge</span>, testId: 'option-b' },
  { id: 'c', label: 'Option C', disabled: true, testId: 'option-c' },
];

const renderDropdown = (props: Partial<Parameters<typeof DropdownMenu>[0]> = {}) => {
  const onSelect = vi.fn();
  render(<DropdownMenu trigger="Pick one" options={options} onSelect={onSelect} {...props} />);
  return { onSelect };
};

test('renders the trigger and keeps the menu closed initially', () => {
  renderDropdown();

  expect(screen.getByTestId('dropdownMenu')).toHaveTextContent('Pick one');
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});

test('opens on click and lists every option', async () => {
  renderDropdown();

  fireEvent.click(screen.getByTestId('dropdownMenu'));

  const items = await screen.findAllByRole('menuitem');
  expect(items).toHaveLength(3);
  expect(screen.getByTestId('option-a')).toHaveTextContent('first option');
  expect(screen.getByTestId('option-b')).toHaveTextContent('badge');
});

test('selecting an option calls onSelect and closes the menu', async () => {
  const { onSelect } = renderDropdown();

  fireEvent.click(screen.getByTestId('dropdownMenu'));
  fireEvent.click(await screen.findByTestId('option-b'));

  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }));
  await waitFor(() => {
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

test('a disabled option does not fire onSelect', async () => {
  const { onSelect } = renderDropdown();

  fireEvent.click(screen.getByTestId('dropdownMenu'));
  fireEvent.click(await screen.findByTestId('option-c'));

  expect(onSelect).not.toHaveBeenCalled();
});

test('marks the selected option', async () => {
  renderDropdown({ selectedId: 'a' });

  fireEvent.click(screen.getByTestId('dropdownMenu'));

  await waitFor(() => {
    expect(screen.getByTestId('option-a')).toHaveClass('Mui-selected');
  });
});

test('renders an optional header and footer', async () => {
  renderDropdown({ header: 'Versions', footer: 'Saving creates a new version' });

  fireEvent.click(screen.getByTestId('dropdownMenu'));

  expect(await screen.findByText('Versions')).toBeInTheDocument();
  expect(screen.getByText('Saving creates a new version')).toBeInTheDocument();
});

test('a disabled dropdown cannot be opened', () => {
  renderDropdown({ disabled: true });

  fireEvent.click(screen.getByTestId('dropdownMenu'));

  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});

test('applies caller class names and a custom test id', () => {
  renderDropdown({ triggerClassName: 'my-trigger', testId: 'versionPill' });

  expect(screen.getByTestId('versionPill')).toHaveClass('my-trigger');
});
