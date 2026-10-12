import { render, screen } from '@testing-library/react';
import { setOrganizationServices } from 'services/AuthService';
import { Guardrails } from './Guardrails';

test('says Guardrails is coming soon when the org has not been rolled out', () => {
  setOrganizationServices(JSON.stringify({ aiGuardrailEnabled: false }));
  render(<Guardrails />);

  expect(screen.getByTestId('guardrails')).toHaveTextContent('Guardrails coming soon');
});

test('tells a rolled-out org it is on its way instead of the generic message', () => {
  setOrganizationServices(JSON.stringify({ aiGuardrailEnabled: true }));
  render(<Guardrails />);

  const text = screen.getByTestId('guardrails');
  expect(text).toHaveTextContent(
    'Guardrails for this assistant are being rolled out for your organization. Check back soon.'
  );
  expect(text).not.toHaveTextContent('coming soon');
});
