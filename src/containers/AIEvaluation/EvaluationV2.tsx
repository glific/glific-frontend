import { t } from 'i18next';
import { Heading } from 'components/UI/Heading/Heading';

export default function EvaluationV2() {
  return (
    <>
      <Heading formTitle={t('AI Evaluation v2')} />
      <div data-testid="comingSoon">Coming soon</div>
    </>
  );
}
