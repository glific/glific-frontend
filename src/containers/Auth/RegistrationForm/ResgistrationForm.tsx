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
import { ReachOutToUs } from './ReachOutToUs/ReachOutToUs';

export const RegistrationForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [openDialog, setDialogOpen] = useState(false);
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
    }
  };

  return (
    <div className={styles.Container}>
      <div className={styles.LeftContainer}>
        <div
          onClick={() => {
            if (params.step && parseInt(params.step) > 1) {
              navigate(`/registration/${parseInt(params.step) - 1}`);
            }
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
          open={openDialog}
          setOpen={setDialogOpen}
          handleCancel={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default RegistrationForm;
