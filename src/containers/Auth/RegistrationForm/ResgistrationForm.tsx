import { useEffect, useState } from 'react';
import styles from './ResgistrationForm.module.css';
import { Step, StepLabel, Stepper } from '@mui/material';
import GlificLogo from 'assets/images/logo/Logo.svg';
import BackButton from 'assets/images/icons/BackIconFlow.svg?react';
import { useNavigate } from 'react-router';
import { PlatformDetails } from './Steps/PlatformDetails';
import { OrgDetails } from './Steps/OrgDetails';
import { PaymentDetails } from './Steps/PaymentDetails';
import { SigningAuthority } from './Steps/SigningAuthority';
import { ReachOutToUs } from './ReachOutToUs/ReachOutToUs';

export const RegistrationForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [openDialog, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const steps = [
    {
      label: 'About the organization',
      _id: 0,
    },
    {
      label: 'Glific platform details',
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
    if (activeStep === 0 && !forward) return navigate('/registration');

    if (activeStep === 3 && forward) return navigate('/registration/complete');

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

  useEffect(() => {
    const existingData = localStorage.getItem('registrationData');
    if (existingData) {
      const data = JSON.parse(existingData);
      setActiveStep(data.activeStep + 1 || 0);
    }
  }, []);

  const getForm = (step: number) => {
    switch (step) {
      case 0:
        return <PlatformDetails handleStepChange={handleStepChange} />;
      case 1:
        return <OrgDetails handleStepChange={handleStepChange} />;
      case 2:
        return <PaymentDetails handleStepChange={handleStepChange} />;
      case 3:
        return (
          <SigningAuthority openReachOutToUs={setDialogOpen} handleStepChange={handleStepChange} />
        );
    }
  };

  return (
    <div className={styles.Container}>
      <div className={styles.LeftContainer}>
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
              <span onClick={() => setDialogOpen(true)} className={styles.ReachOut}>
                Reach out here
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className={styles.RightContainer}>{getForm(activeStep)}</div>

      {openDialog && (
        <ReachOutToUs
          handleStepChange={handleStepChange}
          open={openDialog}
          setOpen={setDialogOpen}
          handleCancel={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default RegistrationForm;
