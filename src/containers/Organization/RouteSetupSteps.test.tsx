import { render, act, fireEvent } from '@testing-library/react';
import RouteSetupSteps from './RouteSetupSteps';

it('it renders component correctly', () => {
  const { getByText } = render(<RouteSetupSteps />);

  expect(getByText('Setup your NGO on Glific')).toBeInTheDocument();
  const continueButton = getByText('CONTINUE');
  expect(continueButton).toBeInTheDocument();

  act(() => {
    fireEvent.click(continueButton);
  });

  expect(getByText('Setup your NGO on Glific')).toBeInTheDocument();

  const getStartedButton = getByText('GET STARTED');
  expect(getStartedButton).toBeInTheDocument();

  act(() => {
    fireEvent.click(getStartedButton);
  });
});
