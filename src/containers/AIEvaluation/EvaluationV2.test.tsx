import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import EvaluationV2 from '../EvaluationV2';

vi.mock('i18next', () => ({ t: (key: string) => key }));

test('renders the coming soon placeholder', () => {
  render(
    <MemoryRouter>
      <EvaluationV2 />
    </MemoryRouter>
  );

  expect(screen.getByTestId('headerTitle')).toHaveTextContent('AI Evaluation v2.0');
  expect(screen.getByTestId('comingSoon')).toHaveTextContent('Coming soon');
});
