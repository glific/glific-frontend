import { useEffect, useState } from 'react';
import styles from './ResgistrationForm.module.css';
import { Step, StepLabel, Stepper } from '@mui/material';
import GlificLogo from 'assets/images/logo/Logo.svg';
import BackButton from 'assets/images/icons/BackIconFlow.svg?react';
import { useNavigate, useParams } from 'react-router';
import { PlatformDetails } from './Steps/PlatformDetails';
import { OrgDetails } from './Steps/OrgDetails';
import { PaymentDetails } from './Steps/PaymentDetails';
import { SigningAuthority } from './Steps/SigningAuthority';

export const RegistrationForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (params.step) {
      setActiveStep(parseInt(params.step) - 1);
    }
  }, [params]);

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

  const getForm = (step: number) => {
    switch (step) {
      case 0:
        return <PlatformDetails />;
      case 1:
        return <OrgDetails />;
      case 2:
        return <PaymentDetails />;
      case 3:
        return <SigningAuthority />;
      default:
        return <div>In progress</div>;
    }
  };

  return (
    <div className={styles.Container}>
      <div className={styles.LeftContainer}>
        <div className={styles.BackButton}>
          <BackButton
            onClick={() => {
              params.step &&
                parseInt(params.step) > 1 &&
                navigate(`/registration/${parseInt(params.step) - 1}`);
            }}
          />
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
      <div className={styles.RightContainer}>{getForm(activeStep)}</div>
    </div>
  );
};

export default RegistrationForm;
