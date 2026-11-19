import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';
import { Input } from 'components/UI/Form/Input/Input';
import type { SetReplyFieldProps } from 'containers/AIEvaluation/types/guardrailType';
import styles from './SetReplyField.module.css';

export const SetReplyField = ({ value, onChange, placeholder }: SetReplyFieldProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.Field}>
      <div className={styles.Label}>{t('Set reply — sent when this guardrail is flagged')}</div>
      <Input
        type="text"
        textArea
        rows={2}
        placeholder={t(placeholder)}
        field={{ name: 'setReply', value, onBlur: () => {} }}
        onChange={onChange}
        inputProp={{ 'data-testid': 'setReplyInput' }}
      />
      <div className={styles.LanguageNote}>
        <LanguageIcon className={styles.LanguageIcon} />
        {t(
          'Write this in any one language — AI automatically translates it to match the language the user wrote in (e.g. a Hindi message gets the reply in Hindi).'
        )}
      </div>
    </div>
  );
};

export default SetReplyField;
