import { fireEvent, render, screen } from '@testing-library/react';

import { IconButton } from './IconButton';

test('renders its icon and fires onClick', () => {
  const onClick = vi.fn();
  render(
    <IconButton onClick={onClick} data-testid="copyButton">
      <svg data-testid="icon" />
    </IconButton>
  );

  expect(screen.getByTestId('icon')).toBeInTheDocument();

  fireEvent.click(screen.getByTestId('copyButton'));
  expect(onClick).toHaveBeenCalled();
});

test('passes MUI props through, and a disabled button ignores clicks', () => {
  const onClick = vi.fn();
  render(
    <IconButton onClick={onClick} disabled size="small" className="my-class" data-testid="copyButton">
      <svg />
    </IconButton>
  );

  const button = screen.getByTestId('copyButton');
  expect(button).toBeDisabled();
  expect(button).toHaveClass('my-class');

  fireEvent.click(button);
  expect(onClick).not.toHaveBeenCalled();
});
