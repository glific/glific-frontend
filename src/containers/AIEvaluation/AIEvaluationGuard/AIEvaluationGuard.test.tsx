import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { setOrganizationServices } from 'services/AuthService';
import AIEvaluationGuard from './AIEvaluationGuard';

const renderGuard = () =>
  render(
    <MemoryRouter initialEntries={['/ai-evaluation-v2']}>
      <Routes>
        <Route path="/ai-evaluation-v2" element={<AIEvaluationGuard />}>
          <Route index element={<div data-testid="module">AI Evaluation v2</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

afterEach(() => {
  localStorage.removeItem('organizationServices');
});

test('renders the module when both flags are on', () => {
  setOrganizationServices(JSON.stringify({ aiEvaluationsEnabled: true, aiEvaluationV2Enabled: true }));

  renderGuard();

  expect(screen.getByTestId('module')).toBeInTheDocument();
  expect(screen.queryByTestId('aiEvaluationV2Disabled')).not.toBeInTheDocument();
});

test('blocks the URL when the v2 flag is off', () => {
  setOrganizationServices(JSON.stringify({ aiEvaluationsEnabled: true, aiEvaluationV2Enabled: false }));

  renderGuard();

  expect(screen.getByTestId('aiEvaluationV2Disabled')).toBeInTheDocument();
  expect(screen.queryByTestId('module')).not.toBeInTheDocument();
});

test('blocks the URL when AI Evaluations itself is off', () => {
  // the menu nests v2 inside the v1 block, so the routes have to agree
  setOrganizationServices(JSON.stringify({ aiEvaluationsEnabled: false, aiEvaluationV2Enabled: true }));

  renderGuard();

  expect(screen.getByTestId('aiEvaluationV2Disabled')).toBeInTheDocument();
});

test('blocks the URL when no services are configured at all', () => {
  renderGuard();

  expect(screen.getByTestId('aiEvaluationV2Disabled')).toBeInTheDocument();
});
