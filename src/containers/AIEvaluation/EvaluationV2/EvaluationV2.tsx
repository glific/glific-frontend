import { t } from 'i18next';

import { Heading } from 'components/UI/Heading/Heading';

// ponytail: placeholder page — replace body when AI Evaluation v2.0 ships
export default function EvaluationV2() {
  return (
    <>
      <Heading formTitle={t('AI Evaluation v2.0')} />
      <div data-testid="comingSoon">Coming soon</div>
    </>
  );
}
