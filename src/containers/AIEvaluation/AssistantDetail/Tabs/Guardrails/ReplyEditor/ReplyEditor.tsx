import { useTranslation } from 'react-i18next';
import type { ReplyEditorProps } from 'containers/AIEvaluation/types/guardrailType';
import { GuardrailEditor } from '../GuardrailEditor/GuardrailEditor';
import { SetReplyField } from '../SetReplyField/SetReplyField';

export const ReplyEditor = ({ value, onChange }: ReplyEditorProps) => {
  const { t } = useTranslation();

  return (
    <GuardrailEditor
      summary={value.trim() ? t('Reply set') : t('No reply set')}
      toggleTestId="editReplyToggle"
      bodyTestId="replyEditorBody"
    >
      <SetReplyField
        value={value}
        onChange={onChange}
        placeholder="What should the assistant say when it blocks an abusive message?"
      />
    </GuardrailEditor>
  );
};

export default ReplyEditor;
