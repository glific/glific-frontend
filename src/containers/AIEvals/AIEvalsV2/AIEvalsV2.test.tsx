import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

vi.mock('i18next', () => ({ t: (key: string) => key }));

import AIEvalsV2 from './AIEvalsV2';

test('renders the coming soon placeholder', () => {
  render(
    <MemoryRouter>
      <AIEvalsV2 />
    </MemoryRouter>
  );

  expect(screen.getByTestId('headerTitle')).toHaveTextContent('AI Evals v2.0');
  expect(screen.getByTestId('comingSoon')).toHaveTextContent('Coming soon');
});
