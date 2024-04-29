import { useState } from 'react';
import styles from './ResgistrationForm.module.css';
import { Step, StepLabel, Stepper } from '@mui/material';
import GlificLogo from 'assets/images/logo/Logo.svg';
import BackButton from 'assets/images/icons/BackIconFlow.svg?react';
import { Form } from './Form';

export const RegistrationForm = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'About the organization',
      _id: 1,
    },
    {
      label: 'Glific platform details',
      _id: 2,
    },
    {
      label: 'Payment details',
      _id: 3,
    },
    {
      label: 'Submitter & Authority details',
      _id: 4,
    },
  ];

  return (
    <div className={styles.Container}>
      <div className={styles.LeftContainer}>
        <div className={styles.BackButton}>
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
              Have a question? <span className={styles.ReachOut}>Reach out here</span>
            </p>
          </div>
        </div>
      </div>
      <div className={styles.RightContainer}>
        <Form />
      </div>
    </div>
  );
};

export default RegistrationForm;
