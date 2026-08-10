import { fireEvent, render, screen } from '@testing-library/react';

import { SegmentedControl } from './SegmentedControl';

const options = [{ value: 'low' }, { value: 'medium' }, { value: 'high' }];

const renderControl = (props: Partial<Parameters<typeof SegmentedControl>[0]> = {}) => {
  const onChange = vi.fn();
  render(<SegmentedControl options={options} value="medium" onChange={onChange} {...props} />);
  return { onChange };
};

test('renders every option and marks the selected one', () => {
  renderControl();

  expect(screen.getAllByRole('radio')).toHaveLength(3);
  expect(screen.getByTestId('segmentedControl-medium')).toHaveAttribute('aria-checked', 'true');
  expect(screen.getByTestId('segmentedControl-low')).toHaveAttribute('aria-checked', 'false');
});

test('clicking an option reports its value', () => {
  const { onChange } = renderControl();

  fireEvent.click(screen.getByTestId('segmentedControl-high'));

  expect(onChange).toHaveBeenCalledWith('high');
});

test('falls back to the value when an option has no label', () => {
  renderControl();

  expect(screen.getByTestId('segmentedControl-low')).toHaveTextContent('low');
});

test('renders a custom label node when one is given', () => {
  renderControl({ options: [{ value: 'low', label: <span>Short replies</span> }, { value: 'high' }] });

  expect(screen.getByTestId('segmentedControl-low')).toHaveTextContent('Short replies');
});

test('no label is rendered unless one is passed', () => {
  renderControl();

  expect(screen.queryByTestId('segmentedControl-label')).not.toBeInTheDocument();
});

test('renders the label and helper text when given', () => {
  renderControl({ label: 'Verbosity', helperText: 'How long the replies run.' });

  expect(screen.getByTestId('segmentedControl-label')).toHaveTextContent('Verbosity');
  expect(screen.getByText('How long the replies run.')).toBeInTheDocument();
});

test('a disabled control ignores clicks', () => {
  const { onChange } = renderControl({ disabled: true });

  fireEvent.click(screen.getByTestId('segmentedControl-high'));

  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByTestId('segmentedControl-high')).toBeDisabled();
});

test('a single disabled option ignores clicks while the rest still work', () => {
  const { onChange } = renderControl({ options: [{ value: 'low', disabled: true }, { value: 'high' }] });

  fireEvent.click(screen.getByTestId('segmentedControl-low'));
  expect(onChange).not.toHaveBeenCalled();

  fireEvent.click(screen.getByTestId('segmentedControl-high'));
  expect(onChange).toHaveBeenCalledWith('high');
});

test('applies caller class names and test ids', () => {
  renderControl({
    testId: 'effortSegment',
    className: 'my-wrapper',
    trackClassName: 'my-track',
    optionClassName: 'my-option',
    activeOptionClassName: 'my-active',
  });

  expect(screen.getByTestId('effortSegment')).toHaveClass('my-track');
  expect(screen.getByTestId('effortSegment-low')).toHaveClass('my-option');
  expect(screen.getByTestId('effortSegment-medium')).toHaveClass('my-active');
});

test('an option can override its own test id', () => {
  renderControl({ options: [{ value: 'low', testId: 'lowOption' }, { value: 'high' }] });

  expect(screen.getByTestId('lowOption')).toBeInTheDocument();
});
