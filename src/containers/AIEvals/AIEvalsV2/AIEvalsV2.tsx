import { t } from 'i18next';

import { Heading } from 'components/UI/Heading/Heading';

// ponytail: placeholder page — replace body when AI Evals v2.0 ships
export default function AIEvalsV2() {
  return (
    <>
      <Heading formTitle={t('AI Evals v2.0')} />
      <div data-testid="comingSoon">Coming soon</div>
    </>
  );
}
