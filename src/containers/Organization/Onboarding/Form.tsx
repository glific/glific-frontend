import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Step, StepLabel, Stepper } from '@mui/material';

import GlificLogo from 'assets/images/logo/Logo.svg';
import BackButton from 'assets/images/icons/BackIconFlow.svg?react';

import styles from './Form.module.css';
import { PlatformDetails } from './Steps/PlatformDetails';
import { OrgDetails } from './Steps/OrgDetails';
import { PaymentDetails } from './Steps/PaymentDetails';
import { SigningAuthority } from './Steps/SigningAuthority';
import { ReachOutToUs } from './ReachOutToUs/ReachOutToUs';
import { Success } from './Success/Success';

export const RegistrationForm = () => {
  const [activeStep, setActiveStep] = useState(4);
  const [openDialog, setDialogOpen] = useState<string | boolean>(false);
  const navigate = useNavigate();

  const steps = [
    {
      label: 'Bot details',
      _id: 0,
    },
    {
      label: 'Organization details',
      _id: 1,
    },
    {
      label: 'Payment details',
      _id: 2,
    },
    {
      label: 'Submitter & Authority details',
      _id: 3,
    },
  ];

  const handleStepChange = (forward: boolean = true) => {
    if (activeStep === 0 && !forward) return navigate('/organization-registration');

    if (activeStep === 4 && forward) return navigate('/login');

    if (forward) setActiveStep(activeStep + 1);
    else setActiveStep(activeStep - 1);

    const existingData = localStorage.getItem('registrationData');

    if (existingData) {
      let data = {
        ...JSON.parse(existingData),
        activeStep,
      };
      localStorage.setItem('registrationData', JSON.stringify(data));
    }
  };

  const saveData = (registrationData: any, identifier: string) => {
    const existingData = localStorage.getItem('registrationData');

    let data = {
      [identifier]: registrationData,
    };

    if (existingData) {
      data = {
        ...JSON.parse(existingData),
        ...data,
      };
    }

    localStorage.setItem('registrationData', JSON.stringify(data));
  };

  useEffect(() => {
    const existingData = localStorage.getItem('registrationData');
    if (existingData) {
      const data = JSON.parse(existingData);
      // setActiveStep(data.activeStep || 0);
    }
  }, []);

  const getForm = (step: number) => {
    switch (step) {
      case 0:
        return <PlatformDetails saveData={saveData} handleStepChange={handleStepChange} />;
      case 1:
        return <OrgDetails saveData={saveData} handleStepChange={handleStepChange} />;
      case 2:
        return <PaymentDetails saveData={saveData} handleStepChange={handleStepChange} />;
      case 3:
        return (
          <SigningAuthority
            saveData={saveData}
            openReachOutToUs={setDialogOpen}
            handleStepChange={handleStepChange}
          />
        );
      case 4:
        return <Success />;
    }
  };

  return (
    <div className={styles.Container}>
      <div className={activeStep === 4 ? styles.Hide : styles.LeftContainer}>
        <div
          onClick={() => {
            handleStepChange(false);
          }}
          data-testid="back-button"
          className={styles.BackButton}
        >
          <BackButton />
        </div>
        <div>
          <img src={GlificLogo} className={styles.GlificLogo} alt="Glific" />
        </div>
        <div className={styles.Content}>
          <Stepper className={styles.Stepper} activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <p className={`${styles.Step} ${activeStep === index && styles.Active}`}>
                    {step.label}
                  </p>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <div className={styles.LeftFooter}>
            <p>
              Have a question?{' '}
              <span onClick={() => setDialogOpen('reachOut')} className={styles.ReachOut}>
                Reach out here
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className={activeStep === 4 ? styles.FullWidth : styles.RightContainer}>
        {getForm(activeStep)}
      </div>

      {openDialog && (
        <ReachOutToUs
          handleStepChange={handleStepChange}
          open={openDialog}
          setOpen={setDialogOpen}
          saveData={saveData}
        />
      )}
    </div>
  );
};

export default RegistrationForm;
