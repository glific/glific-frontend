import { render, act, fireEvent } from '@testing-library/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import RouteSetupSteps from './RouteSetupSteps';

it('it renders component correctly', () => {
  const { getByText } = render(
    <GoogleReCaptchaProvider reCaptchaKey="test key">
      <RouteSetupSteps />
    </GoogleReCaptchaProvider>
  );

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
