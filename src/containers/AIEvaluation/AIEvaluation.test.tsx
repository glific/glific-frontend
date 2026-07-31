import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import AIEvaluation from './AIEvaluation';

vi.mock('i18next', () => ({ t: (key: string) => key }));

test('renders the coming soon placeholder', () => {
  render(
    <MemoryRouter>
      <AIEvaluation />
    </MemoryRouter>
  );

  expect(screen.getByTestId('headerTitle')).toHaveTextContent('AI Evaluation v2');
  expect(screen.getByTestId('comingSoon')).toHaveTextContent('Coming soon');
});
