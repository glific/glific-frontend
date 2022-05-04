import React, { useState } from 'react';

import { FB_MANAGER_VERIFICATION, GUPSHUP_ACCOUNT_CREATION } from 'common/constants';
import { StaticOrganizationContents } from './StaticOrganizationContents/StaticOrganizationContents';
import { Registration } from './Registration/Registration';

export const RouteSetupSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const links = [
    {
      title: 'Facebook business manager verification',
      link: FB_MANAGER_VERIFICATION,
    },
    {
      title: 'Gupshup account creation',
      link: GUPSHUP_ACCOUNT_CREATION,
    },
  ];

  const handleStep = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
  };

  switch (currentStep) {
    case 0:
      return (
        <StaticOrganizationContents
          title="Setup your NGO on Glific"
          subtitle="Before you get started, please make sure you have completed the following processes:"
          links={links}
          buttonText="Continue"
          handleStep={handleStep}
        />
      );
    case 1:
      return (
        <Registration
          title="Setup your NGO on Glific"
          handleStep={handleStep}
          buttonText="Get Started"
        />
      );
    case 2:
      return (
        <StaticOrganizationContents
          title="Thank you! Your setup has been initiated."
          subtitle="We will get back to you with further steps once the setup is complete."
        />
      );
    default:
      return null;
  }
};
export default RouteSetupSteps;
