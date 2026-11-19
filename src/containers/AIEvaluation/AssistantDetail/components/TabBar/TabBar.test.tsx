import { fireEvent, render, screen, within } from '@testing-library/react';
import { TabBar } from './TabBar';

const renderBar = (props: Partial<Parameters<typeof TabBar>[0]> = {}) => {
  const onChange = vi.fn();
  render(<TabBar activeTab="persona" onChange={onChange} {...props} />);
  return { onChange };
};

test('marks the open tab and reports a switch', () => {
  const { onChange } = renderBar();

  expect(screen.getByTestId('tab-persona')).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByTestId('tab-evaluation')).toHaveAttribute('aria-selected', 'false');

  fireEvent.click(screen.getByTestId('tab-evaluation'));
  expect(onChange).toHaveBeenCalledWith('evaluation');
});

test('a tab with nothing pending carries no dot', () => {
  renderBar();

  expect(screen.queryByTestId('tabDirtyDot-persona')).not.toBeInTheDocument();
  expect(screen.queryByTestId('tabRunningDot-evaluation')).not.toBeInTheDocument();
});

test('unsaved work and a running evaluation are each flagged on their own tab', () => {
  renderBar({ dirtyTabs: { persona: true }, runningTabs: { evaluation: true } });

  expect(screen.getByTestId('tabDirtyDot-persona')).toBeInTheDocument();
  expect(screen.getByTestId('tabRunningDot-evaluation')).toBeInTheDocument();

  // the flags stay on their own tab rather than lighting up the bar
  expect(screen.queryByTestId('tabRunningDot-persona')).not.toBeInTheDocument();
  expect(screen.queryByTestId('tabDirtyDot-evaluation')).not.toBeInTheDocument();
});

test('a tab marked new carries a New badge, and only that tab', () => {
  renderBar({ newTabs: { guardrails: true } });

  expect(within(screen.getByTestId('tab-guardrails')).getByTestId('beta-tag')).toHaveTextContent('New');
  expect(screen.getAllByTestId('beta-tag')).toHaveLength(1);
});
