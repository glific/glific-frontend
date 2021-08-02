import { render, act, fireEvent } from '@testing-library/react';

import RouteSetupSteps from './RouteSetupSteps';

it('it renders component correctly', () => {
  const { getByText } = render(<RouteSetupSteps />);

  expect(getByText('Setup your NGO on Glific')).toBeInTheDocument();
  const continueButton = getByText('Continue');
  expect(continueButton).toBeInTheDocument();

  act(() => {
    fireEvent.click(continueButton);
  });

  expect(getByText('Setup your NGO on Glific')).toBeInTheDocument();

  const getStartedButton = getByText('Get Started');
  expect(getStartedButton).toBeInTheDocument();

  act(() => {
    fireEvent.click(getStartedButton);
  });
});
