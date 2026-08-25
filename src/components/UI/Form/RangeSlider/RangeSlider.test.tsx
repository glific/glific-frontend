import { fireEvent, render, screen } from '@testing-library/react';
import { RangeSlider } from './RangeSlider';

const renderSlider = (props: Partial<Parameters<typeof RangeSlider>[0]> = {}) => {
  const onChange = vi.fn();
  const onClear = vi.fn();
  render(<RangeSlider value={1} min={0} max={2} onChange={onChange} onClear={onClear} {...props} />);
  return { onChange, onClear };
};

test('the bounds either side of the track come from min and max', () => {
  renderSlider({ min: 0.5, max: 1.5 });

  expect(screen.getByText('0.5')).toBeInTheDocument();
  expect(screen.getByText('1.5')).toBeInTheDocument();
});

test('the number box shows the current value', () => {
  renderSlider({ value: 0.7 });

  expect(screen.getByTestId('rangeSliderInput')).toHaveValue(0.7);
});

test('typing a value in range reports it as typed', () => {
  const { onChange } = renderSlider();

  fireEvent.change(screen.getByTestId('rangeSliderInput'), { target: { value: '1.25' } });

  expect(onChange).toHaveBeenCalledWith(1.25);
});

test('a value above max is pulled back to max', () => {
  const { onChange } = renderSlider();

  fireEvent.change(screen.getByTestId('rangeSliderInput'), { target: { value: '9' } });

  expect(onChange).toHaveBeenCalledWith(2);
});

test('a value below min is pulled up to min', () => {
  const { onChange } = renderSlider({ min: 0.5 });

  fireEvent.change(screen.getByTestId('rangeSliderInput'), { target: { value: '-4' } });

  expect(onChange).toHaveBeenCalledWith(0.5);
});

test('emptying the box asks the caller to clear rather than reporting a number', () => {
  const { onChange, onClear } = renderSlider();

  fireEvent.change(screen.getByTestId('rangeSliderInput'), { target: { value: '' } });

  expect(onClear).toHaveBeenCalled();
  expect(onChange).not.toHaveBeenCalled();
});

test('an empty value leaves the box blank and rests the slider at min', () => {
  renderSlider({ value: '', min: 0.5 });

  expect(screen.getByTestId('rangeSliderInput')).toHaveValue(null);
  expect(screen.getByRole('slider')).toHaveValue('0.5');
});

test('dragging the slider reports the value it lands on', () => {
  const { onChange } = renderSlider();

  fireEvent.change(screen.getByRole('slider'), { target: { value: '1.5' } });

  expect(onChange).toHaveBeenCalledWith(1.5);
});

test('both controls are inert when disabled', () => {
  renderSlider({ disabled: true });

  expect(screen.getByTestId('rangeSliderInput')).toBeDisabled();
  expect(screen.getByRole('slider')).toBeDisabled();
});

test('the test ids can be named by the caller', () => {
  renderSlider({ testId: 'temperatureSlider', inputTestId: 'temperatureInput' });

  expect(screen.getByTestId('temperatureSlider')).toBeInTheDocument();
  expect(screen.getByTestId('temperatureInput')).toBeInTheDocument();
});

test('emptying the box is safe when the caller offers no clear handler', () => {
  const onChange = vi.fn();
  render(<RangeSlider value={1} min={0} max={2} onChange={onChange} />);

  fireEvent.change(screen.getByTestId('rangeSliderInput'), { target: { value: '' } });

  expect(onChange).not.toHaveBeenCalled();
});
