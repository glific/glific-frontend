import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InfoListPopover } from './InfoListPopover';

const entries = [
  {
    title: 'Removed the promotional opening line.',
    description: 'Utility templates may not open with a marketing hook.',
    linkLabel: 'Utility vs marketing categories',
    linkUrl: 'https://example.com/utility',
  },
  {
    title: 'Added the order number placeholder.',
    description: 'A transactional message must reference the order it is about.',
    linkLabel: 'Writing transactional messages',
    linkUrl: 'https://example.com/transactional',
  },
];

test('the list is behind the trigger until it is asked for', async () => {
  const user = userEvent.setup();
  render(<InfoListPopover entries={entries} triggerLabel="View what changed" heading="What the AI changed" />);

  expect(screen.queryByTestId('info-list-popover-panel')).not.toBeInTheDocument();

  await user.click(screen.getByTestId('info-list-popover'));

  expect(await screen.findByTestId('info-list-popover-panel')).toBeInTheDocument();
  expect(screen.getByText('What the AI changed')).toBeInTheDocument();
});

test('renders one entry per change, each with its own safely-targeted link', async () => {
  const user = userEvent.setup();
  render(<InfoListPopover entries={entries} triggerLabel="View what changed" />);

  await user.click(screen.getByTestId('info-list-popover'));

  expect(await screen.findAllByTestId('info-list-popover-entry')).toHaveLength(2);
  expect(screen.getByText('Removed the promotional opening line.')).toBeInTheDocument();
  expect(screen.getByText('Utility templates may not open with a marketing hook.')).toBeInTheDocument();

  const link = screen.getByRole('link', { name: /Utility vs marketing categories/ });
  expect(link).toHaveAttribute('href', 'https://example.com/utility');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  expect(screen.getByRole('link', { name: /Writing transactional messages/ })).toHaveAttribute(
    'href',
    'https://example.com/transactional'
  );
});

test('an entry without a link or description is just its title, and an unlabelled link reads "Learn more"', async () => {
  const user = userEvent.setup();
  render(
    <InfoListPopover
      entries={[{ title: 'Shortened the message.' }, { title: 'Dropped the emoji.', linkUrl: 'https://example.com/x' }]}
      triggerLabel="View what changed"
    />
  );

  await user.click(screen.getByTestId('info-list-popover'));

  expect(await screen.findAllByTestId('info-list-popover-entry')).toHaveLength(2);
  expect(screen.getAllByRole('link')).toHaveLength(1);
  expect(screen.getByRole('link', { name: /Learn more/ })).toHaveAttribute('href', 'https://example.com/x');
});

test('an empty list says so instead of opening a blank panel', async () => {
  const user = userEvent.setup();
  render(<InfoListPopover entries={[]} triggerLabel="View what changed" testId="rewrite-changes" />);

  await user.click(screen.getByTestId('rewrite-changes'));

  expect(await screen.findByText('No details available.')).toBeInTheDocument();
  expect(screen.queryByTestId('rewrite-changes-entry')).not.toBeInTheDocument();
});

test('the empty message can be written for the feature it sits in', async () => {
  const user = userEvent.setup();
  render(<InfoListPopover entries={[]} triggerLabel="View what changed" emptyText="Nothing was changed." />);

  await user.click(screen.getByTestId('info-list-popover'));

  expect(await screen.findByText('Nothing was changed.')).toBeInTheDocument();
});

test('the trigger tells assistive tech that it opens something, and closes again on Escape', async () => {
  const user = userEvent.setup();
  render(<InfoListPopover entries={entries} triggerLabel="View what changed" />);

  const trigger = screen.getByTestId('info-list-popover');
  expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');

  await user.click(trigger);
  expect(await screen.findByTestId('info-list-popover-panel')).toBeInTheDocument();
  expect(trigger).toHaveAttribute('aria-expanded', 'true');

  await user.keyboard('{Escape}');

  expect(trigger).toHaveAttribute('aria-expanded', 'false');
});
