import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { setOrganizationServices } from 'services/AuthService';
import AIEvaluationGuard from './AIEvaluationGuard';

const renderGuard = (path = '/ai-evaluation-v2') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/ai-evaluation-v2" element={<AIEvaluationGuard />}>
          <Route index element={<div data-testid="module">AI Evaluation v2</div>} />
          <Route path=":assistantId" element={<div data-testid="assistantDetail">Assistant</div>} />
        </Route>
        <Route path="/*" element={<div data-testid="chatFallback">Chat</div>} />
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

test('child routes sit under the guard, not the catch-all', () => {
  // a child path is relative to the parent — spelling it out again sends the URL to chat
  setOrganizationServices(JSON.stringify({ aiEvaluationsEnabled: true, aiEvaluationV2Enabled: true }));

  renderGuard('/ai-evaluation-v2/42');

  expect(screen.getByTestId('assistantDetail')).toBeInTheDocument();
  expect(screen.queryByTestId('chatFallback')).not.toBeInTheDocument();
});

test('a child route is blocked too when the flag is off', () => {
  setOrganizationServices(JSON.stringify({ aiEvaluationsEnabled: true, aiEvaluationV2Enabled: false }));

  renderGuard('/ai-evaluation-v2/42');

  expect(screen.getByTestId('aiEvaluationV2Disabled')).toBeInTheDocument();
  expect(screen.queryByTestId('assistantDetail')).not.toBeInTheDocument();
});
