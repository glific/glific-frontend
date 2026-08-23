import { render, screen } from '@testing-library/react';

import { ProgressBar } from './ProgressBar';

test('says what is running, both on screen and to a screen reader', () => {
  render(<ProgressBar label="Rewriting for utility…" />);

  expect(screen.getByText('Rewriting for utility…')).toBeInTheDocument();
  expect(screen.getByRole('progressbar')).toHaveAccessibleName('Rewriting for utility…');
});

test('falls back to a generic accessible name and renders no caption without a label', () => {
  render(<ProgressBar />);

  expect(screen.getByRole('progressbar')).toHaveAccessibleName('Loading...');
  expect(screen.getByTestId('progress-bar').textContent).toBe('');
});

test('the caller can name it for its own tests, and add a class', () => {
  const { container } = render(<ProgressBar testId="rewriteProgress" className="my-progress" />);

  expect(screen.getByTestId('rewriteProgress')).toBeInTheDocument();
  expect(container.querySelector('.my-progress')).toBeInTheDocument();
});
