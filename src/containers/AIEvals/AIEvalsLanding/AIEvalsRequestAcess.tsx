import { useMutation } from '@apollo/client';
import { setErrorMessage, setNotification } from 'common/notification';
import { OrgEvalAccessGateError, OrgEvalAccessGateLoading } from 'containers/AIEvals/OrgEvalAccessGateUi';
import { writeOrgEvalAccessCache } from 'containers/AIEvals/orgEvalAccessCache';
import { useOrgEvalAccessRequest } from 'containers/AIEvals/useOrgEvalAccessRequest';
import { REQUEST_AI_EVALUATION_ACCESS } from 'graphql/mutations/AIEvaluations';
import { t } from 'i18next';
import React, { useState } from 'react';
import { Navigate } from 'react-router';
import styles from './AIEvalsLanding.module.css';

type BenefitText =
  | 'Improve answers on critical topics like health, safety, rights, and legal queries.'
  | 'Ensure user safety by catching harmful or inappropriate responses.'
  | 'Build trust with beneficiaries, partners, and donors through tested, reliable performance.'
  | 'Reduce bias and ensure inclusive, culturally sensitive communication.'
  | 'Monitor quality at scale without needing large teams to manually check conversations.'
  | 'Continuously improve the chatbot by identifying issues early and fixing them quickly.'
  | 'Lower legal and compliance risks by verifying that the bot follows policies and guidelines.';

interface BenefitItem {
  text: BenefitText;
  boldPrefix?: string;
  avatars?: { label: string; bg: string }[];
}

const WHY_USE_EVALS: BenefitItem[] = [
  {
    text: 'Improve answers on critical topics like health, safety, rights, and legal queries.',
    boldPrefix: 'Improve answers',
  },
  {
    text: 'Ensure user safety by catching harmful or inappropriate responses.',
    boldPrefix: 'Ensure user safety',
  },
  {
    text: 'Build trust with beneficiaries, partners, and donors through tested, reliable performance.',
    boldPrefix: 'Build trust',
  },
  {
    text: 'Reduce bias and ensure inclusive, culturally sensitive communication.',
    boldPrefix: 'Reduce bias',
  },
  {
    text: 'Monitor quality at scale without needing large teams to manually check conversations.',
    boldPrefix: 'Monitor quality at scale',
  },
  {
    text: 'Continuously improve the chatbot by identifying issues early and fixing them quickly.',
    boldPrefix: 'Continuously improve',
  },
  {
    text: 'Lower legal and compliance risks by verifying that the bot follows policies and guidelines.',
    boldPrefix: 'Lower legal and compliance risks',
  },
];

const renderBenefitText = (item: BenefitItem): React.ReactNode => {
  const fullText = t(item.text);
  if (!item.boldPrefix) return fullText;
  const idx = fullText.indexOf(item.boldPrefix);
  if (idx === -1) return fullText;
  return (
    <>
      {fullText.slice(0, idx)}
      <strong>{fullText.slice(idx, idx + item.boldPrefix.length)}</strong>
      {fullText.slice(idx + item.boldPrefix.length)}
    </>
  );
};

export default function AIEvalsRequestAcess() {
  const {
    shouldShowFullScreenLoading,
    shouldShowFullScreenError,
    refetchAccess,
    accessStatus,
  } = useOrgEvalAccessRequest();
  const [requested, setRequested] = useState(false);
  const [requestAccess, { loading }] = useMutation(REQUEST_AI_EVALUATION_ACCESS);

  const alreadyRequested = accessStatus === 'pending';

  if (shouldShowFullScreenLoading) {
    return <OrgEvalAccessGateLoading />;
  }

  if (shouldShowFullScreenError) {
    return <OrgEvalAccessGateError onRetry={() => void refetchAccess()} />;
  }

  if (accessStatus === 'approved') {
    return <Navigate to="/ai-evaluations" replace />;
  }

  const handleRequestAccess = async () => {
    try {
      const { data } = await requestAccess();
      const errors = data?.requestAiEvaluationAccess?.errors;
      if (errors?.length) {
        setErrorMessage(errors[0]);
      } else {
        writeOrgEvalAccessCache('pending');
        setRequested(true);
        setNotification(
          t('Your request has been submitted. You will be notified when it gets approved.')
        );
      }
    } catch (error: any) {
      setErrorMessage(error);
    }
  };

  return (
    <div className={styles.Container}>
      <div className={styles.LeftPanel}>
        <span className={styles.BetaBadge}>{t('New Feature')}</span>

        <h1 className={styles.Title}>{t('AI Evaluations')}</h1>
        <p className={styles.Description}>
          {t(
            'AI Evaluations is the process to determine objectively how well the AI assistant is answering a set of questions as compared to human responses for the same questions.'
          )}
        </p>

        <h2 className={styles.SectionTitle}>{t('Why Use Evals?')}</h2>

        <ol className={styles.BenefitsList}>
          {WHY_USE_EVALS.map((item, idx) => (
            <li key={idx} className={styles.BenefitItem}>
              <span className={styles.BenefitNumber}>{idx + 1}.</span>
              {item.avatars && (
                <span className={styles.AvatarGroup}>
                  {item.avatars.map((av, i) => (
                    <span
                      key={i}
                      className={styles.Avatar}
                      style={{
                        backgroundColor: av.bg,
                        marginLeft: i === 0 ? 0 : -8,
                        zIndex: item.avatars!.length - i,
                      }}
                    >
                      {av.label}
                    </span>
                  ))}
                </span>
              )}
              <span className={styles.BenefitText}>{renderBenefitText(item)}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.RightPanel}>
        <h2 className={styles.CTATitle}>{t('Set up your NGO on Evals')}</h2>
        <p className={styles.CTASubtitle}>
          {t('Make your NGO chatbot smarter, safer, and more reliable with AI evals.')}
        </p>

        <div className={styles.LaptopMockup}>
          <div className={styles.LaptopScreen}>
            <div className={styles.LaptopInner}>
              <div className={styles.PreviewCard}>
                <div className={styles.CircleGraphic}>
                  <div className={styles.CircleA} />
                  <div className={styles.CircleB} />
                </div>
                <div className={styles.PreviewText}>
                  <p className={styles.PreviewLabel}>{t('Intro to')}</p>
                  <p className={styles.PreviewTitle}>{t('AI Evals')}</p>
                </div>
                <span className={styles.GlificBadge}>Glific</span>
              </div>
            </div>
          </div>
          <div className={styles.LaptopHinge} />
          <div className={styles.LaptopBase} />
        </div>

        <p className={styles.CTAHelp}>
          {t('Apply for access and tell us what functionality would help your team the most.')}
        </p>

        <button
          type="button"
          className={styles.RequestButton}
          onClick={handleRequestAccess}
          disabled={loading || requested || alreadyRequested}
        >
          {loading
            ? t('Submitting...')
            : requested || alreadyRequested
              ? t('Request Pending')
              : t('Request Access')}
        </button>
      </div>
    </div>
  );
}
