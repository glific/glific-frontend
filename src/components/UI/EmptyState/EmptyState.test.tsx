import { render, screen } from '@testing-library/react';

import { EmptyState } from './EmptyState';

test('shows what is missing and why it matters', () => {
  render(<EmptyState title="Nothing here yet" note="Add the first one to get going." />);

  expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  expect(screen.getByText('Add the first one to get going.')).toBeInTheDocument();
});

test('the icon and the action are optional, and left out when not given', () => {
  const { container } = render(<EmptyState title="Nothing here yet" note="No next step from here." />);

  expect(container.querySelector('svg')).not.toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

test('an action is rendered for the reader to act on', () => {
  render(<EmptyState title="No sets" note="Add one to start." action={<button type="button">Add a set</button>} />);

  expect(screen.getByRole('button', { name: 'Add a set' })).toBeInTheDocument();
});

test('an icon is rendered above the title', () => {
  render(<EmptyState title="No files" note="Upload one." icon={<svg data-testid="documentIcon" />} />);

  expect(screen.getByTestId('documentIcon')).toBeInTheDocument();
});

test('the caller can name it for its own tests, and add a class', () => {
  const { container } = render(<EmptyState title="No runs" note="Run one." testId="noRunsYet" className="my-empty" />);

  expect(screen.getByTestId('noRunsYet')).toBeInTheDocument();
  expect(container.querySelector('.my-empty')).toBeInTheDocument();
});

test('title and note take nodes, not only strings', () => {
  render(<EmptyState title={<span data-testid="richTitle">No runs</span>} note={<b>Run one.</b>} />);

  expect(screen.getByTestId('richTitle')).toBeInTheDocument();
  expect(screen.getByText('Run one.').tagName).toBe('B');
});
