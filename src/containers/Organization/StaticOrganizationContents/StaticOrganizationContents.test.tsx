import { fireEvent, render, within } from '@testing-library/react';

import StaticOrganizationContents from './StaticOrganizationContents';

const props = {
  title: 'Setup glific',
  subtitle: 'How to get started',
  links: [{ title: 'test', link: 'www.example.com' }],
  buttonText: 'Continue',
  handleStep: vi.fn(),
};

test('it renders organization onboarding pre-requisits information', () => {
  const { getByText, getByRole } = render(<StaticOrganizationContents {...props} />);
  expect(getByText('Setup glific')).toBeInTheDocument();
  expect(getByText('How to get started')).toBeInTheDocument();

  const list = getByRole('list', {
    name: /links/i,
  });
  const { getAllByRole } = within(list);
  const items = getAllByRole('listitem');
  expect(items.length).toBe(1);

  const button = getByText('Continue');
  fireEvent.click(button);
});

test('it renders organization onboarding landing page', () => {
  const { getByText } = render(
    <StaticOrganizationContents title="Thank you" subtitle="Setup is complete" />
  );
  expect(getByText('Thank you')).toBeInTheDocument();
  expect(getByText('Setup is complete')).toBeInTheDocument();
});
