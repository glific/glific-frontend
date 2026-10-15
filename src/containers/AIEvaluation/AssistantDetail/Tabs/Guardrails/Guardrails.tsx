import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button } from 'components/UI/Form/Button/Button';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { GET_GUARDRAIL_VALIDATORS } from 'graphql/queries/Guardrails';
import { getOrganizationServices } from 'services/AuthService';
import { DetailTypesEditor, GuardrailRuleCard, GuardrailsHowItWorks, TopicsEditor } from './index';
import type {
  GuardrailAction,
  GuardrailRule,
  GuardrailsPanelProps,
  GuardrailsProps,
  GuardrailStage,
  GuardrailTier,
  GuardrailValidatorsData,
} from 'containers/AIEvaluation/types/guardrailType';
import {
  buildGuardrailRules,
  GUARDRAIL_ACTION_LABEL,
  GUARDRAIL_STAGE_COPY,
  GUARDRAIL_TIER_LABEL,
  rulesWithSpecs,
  buildSavedGuardrails,
} from 'containers/AIEvaluation/utils/guardrails/guardrails';
import styles from './Guardrails.module.css';

const STAGE_ORDER: GuardrailStage[] = ['incoming', 'reply'];
const TIER_ORDER: GuardrailTier[] = ['recommended', 'additional'];
const ACTIONS: GuardrailAction[] = ['fix', 'block'];

export const Guardrails = ({ value, onChange }: GuardrailsProps) => {
  const { t } = useTranslation();
  const isAiGuardrailEnabled = Boolean(getOrganizationServices('aiGuardrailEnabled'));

  if (!isAiGuardrailEnabled) {
    return (
      <div className={styles.Placeholder} data-testid="guardrails">
        {`${t('Guardrails')} ${t('coming soon')}`}
      </div>
    );
  }

  return <GuardrailsLoader value={value} onChange={onChange} />;
};

const GuardrailsLoader = ({ value, onChange }: GuardrailsProps) => {
  const { t } = useTranslation();
  const { data, loading, error } = useQuery<GuardrailValidatorsData>(GET_GUARDRAIL_VALIDATORS);

  if (loading) return <Loading />;

  if (error || !data) {
    return (
      <div className={styles.Placeholder} data-testid="guardrails">
        {t('Guardrails could not be loaded. Please try again.')}
      </div>
    );
  }

  return (
    <GuardrailsPanel
      initialRules={buildGuardrailRules(data.guardrailValidators?.validators ?? [])}
      value={value}
      onChange={onChange}
    />
  );
};

export const GuardrailsPanel = ({ initialRules, value, onChange }: GuardrailsPanelProps) => {
  const { t } = useTranslation();
  const [rules, setRules] = useState<GuardrailRule[]>(() => rulesWithSpecs(initialRules, value));
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const toggleHowItWorks = () => setHowItWorksOpen((open) => !open);
  const emitted = useRef(value);

  useEffect(() => {
    if (value === emitted.current) return;
    emitted.current = value;
    setRules(rulesWithSpecs(initialRules, value));
  }, [value]);

  const updateRule = (id: string, patch: Partial<GuardrailRule>) => {
    const next = rules.map((rule) => (rule.id === id ? ({ ...rule, ...patch } as GuardrailRule) : rule));
    const specs = buildSavedGuardrails(next, value);
    setRules(next);
    emitted.current = specs;
    onChange(specs);
  };

  const renderControl = (rule: GuardrailRule) => {
    if (rule.control.kind === 'detailTypes' && rule.control.groups.length > 0) {
      return (
        <DetailTypesEditor
          groups={rule.control.groups}
          onChange={(groups) => updateRule(rule.id, { control: { kind: 'detailTypes', groups } })}
        />
      );
    }

    if (rule.control.kind === 'topics') {
      const { kind: _kind, ...value } = rule.control;
      return (
        <TopicsEditor
          value={value}
          onChange={(next) => updateRule(rule.id, { control: { kind: 'topics', ...next } })}
        />
      );
    }

    return null;
  };

  return (
    <div className={styles.Panel} data-testid="guardrails">
      <div className={styles.Banner}>
        <div className={styles.BannerHeader}>
          <button
            type="button"
            className={styles.BannerToggle}
            onClick={toggleHowItWorks}
            aria-expanded={howItWorksOpen}
            aria-label={t(howItWorksOpen ? 'Hide' : 'See how')}
            data-testid="guardrailsBannerToggle"
          >
            {howItWorksOpen ? (
              <ExpandMoreIcon className={styles.BannerCaret} />
            ) : (
              <ChevronRightIcon className={styles.BannerCaret} />
            )}
          </button>
          <div className={styles.BannerBody}>
            <div className={styles.BannerTitle}>{t('When a guardrail is triggered, it acts in one of two ways')}</div>
            <div className={styles.Legend} data-testid="guardrailsLegend">
              {ACTIONS.map((action) => (
                <span className={styles.LegendItem} key={action}>
                  <span className={`${styles.LegendDot} ${styles[action]}`} />
                  {t(GUARDRAIL_ACTION_LABEL[action])}
                </span>
              ))}
            </div>
          </div>
          <Button
            variant="outlined"
            className={styles.SeeHowButton}
            onClick={toggleHowItWorks}
            aria-expanded={howItWorksOpen}
            data-testid="guardrailsSeeHowButton"
          >
            {t(howItWorksOpen ? 'Hide' : 'See how')}
            {howItWorksOpen ? (
              <ExpandLessIcon className={styles.SeeHowCaret} />
            ) : (
              <ExpandMoreIcon className={styles.SeeHowCaret} />
            )}
          </Button>
        </div>

        {howItWorksOpen && <GuardrailsHowItWorks />}
      </div>

      {STAGE_ORDER.map((stage) => {
        const stageRules = rules.filter((rule) => rule.stage === stage);
        if (stageRules.length === 0) return null;

        const stageCopy = GUARDRAIL_STAGE_COPY[stage];
        let runningNumber = 0;

        return (
          <div className={styles.Stage} key={stage} data-testid={`guardrailStage-${stage}`}>
            <div className={styles.StageHeader}>
              <span className={styles.StageTitle}>{t(stageCopy.title)}</span>
              <span className={styles.StageNote}>{t(stageCopy.note)}</span>
            </div>

            {TIER_ORDER.map((tier) => {
              const tierRules = stageRules.filter((rule) => rule.tier === tier);
              if (tierRules.length === 0) return null;

              return (
                <div className={styles.TierZone} key={tier}>
                  <div className={styles.TierLabel}>{t(GUARDRAIL_TIER_LABEL[tier])}</div>
                  <div className={styles.TierCard}>
                    {tierRules.map((rule) => {
                      runningNumber += 1;
                      return (
                        <GuardrailRuleCard
                          key={rule.id}
                          id={rule.id}
                          number={runningNumber}
                          title={rule.title}
                          description={rule.description}
                          link={rule.link}
                          action={rule.action}
                          enabled={rule.enabled}
                          onToggle={(enabled) => updateRule(rule.id, { enabled })}
                        >
                          {renderControl(rule)}
                        </GuardrailRuleCard>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Guardrails;
