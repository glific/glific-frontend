import { useMutation } from '@apollo/client';
import { setErrorMessage, setNotification } from 'common/notification';
import { AI_EVALS_INTRO_VIDEO_URL } from 'config';
import { OrgEvalAccessGateError, OrgEvalAccessGateLoading } from 'containers/AIEvals/OrgEvalAccessGateUi';
import { writeOrgEvalAccessCache } from 'containers/AIEvals/orgEvalAccessCache';
import { useOrgEvalAccessRequest } from 'containers/AIEvals/useOrgEvalAccessRequest';
import { REQUEST_AI_EVALUATION_ACCESS } from 'graphql/mutations/AIEvaluations';
import { t } from 'i18next';
import React, { useState } from 'react';
import { Navigate } from 'react-router';
import styles from './AIEvalsRequestAcess.module.css';

type BenefitText =
  | 'Catch harmful or inaccurate responses before users do'
  | 'Build trust with beneficiaries, partners, and donors'
  | 'Reduce bias and ensure culturally sensitive communication'
  | 'Improve continuously — without manual review at scale';

interface BenefitItem {
  text: BenefitText;
  boldPrefix?: string;
}

const WHY_USE_EVALS: BenefitItem[] = [
  {
    text: 'Catch harmful or inaccurate responses before users do',
    boldPrefix: 'Catch harmful',
  },
  {
    text: 'Build trust with beneficiaries, partners, and donors',
    boldPrefix: 'Build trust',
  },
  {
    text: 'Reduce bias and ensure culturally sensitive communication',
    boldPrefix: 'Reduce bias',
  },
  {
    text: 'Improve continuously — without manual review at scale',
    boldPrefix: 'Improve continuously',
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
  const { shouldShowFullScreenLoading, shouldShowFullScreenError, refetchAccess, accessStatus } =
    useOrgEvalAccessRequest();
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
        setNotification(t('Your request has been submitted. You will be notified when it gets approved.'));
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
          {t('See how well your AI assistant answers questions — compared to what a human would say.')}
        </p>

        <h2 className={styles.SectionTitle}>{t('Why Use Evals:')}</h2>

        <ol className={styles.BenefitsList}>
          {WHY_USE_EVALS.map((item, idx) => (
            <li key={idx} className={styles.BenefitItem}>
              <span className={styles.BenefitNumber}>{idx + 1}.</span>
              <span className={styles.BenefitText}>{renderBenefitText(item)}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.RightPanel}>
        <h2 className={styles.CTATitle}>{t('Set up AI Evals for your NGO')}</h2>
        <p className={styles.CTASubtitle}>{t("Monitor and improve your chatbot's quality.")}</p>

        <iframe
          src={AI_EVALS_INTRO_VIDEO_URL}
          className={styles.VideoPlaceholder}
          title="AI Evals intro video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          data-testid="videoPlaceholder"
        />

        <p className={styles.CTAHelp}>{t("Once you request access, we'll enable it within 24 hours")}</p>

        <button
          type="button"
          className={styles.RequestButton}
          onClick={handleRequestAccess}
          disabled={loading || requested || alreadyRequested}
        >
          {loading ? t('Submitting...') : requested || alreadyRequested ? t('Request Pending') : t('Request Access')}
        </button>
      </div>
    </div>
  );
}
