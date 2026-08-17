import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { countAssistantsMock, filterAssistantsMock } from 'mocks/Assistants';
import AIEvaluation from './AIEvaluation';

test('renders the evaluation list', async () => {
  render(
    <MockedProvider mocks={[filterAssistantsMock, countAssistantsMock]}>
      <MemoryRouter initialEntries={['/ai-evaluation-v2']}>
        <AIEvaluation />
      </MemoryRouter>
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Assistant-1')).toBeInTheDocument();
  });
});
