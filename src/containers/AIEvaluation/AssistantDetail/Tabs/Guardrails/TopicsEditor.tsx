import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import { Button } from 'components/UI/Form/Button/Button';
import { Input } from 'components/UI/Form/Input/Input';
import { Tooltip } from 'components/UI/Tooltip/Tooltip';
import type {
  GuardrailTopic,
  GuardrailTopicSuggestion,
  TopicsEditorProps,
} from 'containers/AIEvaluation/types/guardrailType';
import styles from './Guardrails.module.css';

const slugify = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const TopicsEditor = ({ value, onChange }: TopicsEditorProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState('');

  const { disallowedTopics, suggestedTopics, setReply } = value;

  const addTopic = (topic: GuardrailTopic) => {
    const exists = disallowedTopics.some((entry) => entry.label.toLowerCase() === topic.label.toLowerCase());
    if (exists) return;
    onChange({ ...value, disallowedTopics: [...disallowedTopics, topic] });
  };

  const addFromDraft = () => {
    const label = draft.trim();
    if (!label) return;
    addTopic({ id: `custom-${slugify(label)}-${disallowedTopics.length}`, label, description: '' });
    setDraft('');
  };

  const removeTopic = (id: string) => {
    onChange({ ...value, disallowedTopics: disallowedTopics.filter((topic) => topic.id !== id) });
  };

  const isSuggestionAdded = (suggestion: GuardrailTopicSuggestion) =>
    disallowedTopics.some((topic) => topic.label.toLowerCase() === suggestion.label.toLowerCase());

  return (
    <div className={styles.Editor}>
      <button
        type="button"
        className={styles.EditToggle}
        onClick={() => setExpanded((open) => !open)}
        data-testid="editTopicsToggle"
      >
        <EditOutlinedIcon className={styles.EditIcon} />
        {t('Edit topics')}
        <span className={styles.EditSummary}>· {t('{{count}} added', { count: disallowedTopics.length })}</span>
        {expanded ? <ExpandMoreIcon className={styles.EditCaret} /> : <ChevronRightIcon className={styles.EditCaret} />}
      </button>

      {expanded && (
        <div className={styles.EditorBody} data-testid="topicsEditorBody">
          <div className={styles.TopicsLabelRow}>
            <span className={styles.TopicsLabel}>{t('Disallowed topics')}</span>
            <Tooltip
              title={t(
                'The assistant refuses to answer anything matching a topic listed here, and sends the reply below instead.'
              )}
              placement="top"
            >
              <InfoOutlinedIcon className={styles.InfoIcon} data-testid="disallowedTopicsHint" />
            </Tooltip>
          </div>

          <div className={styles.TopicsBox}>
            {disallowedTopics.map((topic) => (
              <span className={styles.TopicChip} key={topic.id} data-testid={`disallowedTopic-${topic.id}`}>
                {topic.description ? `${topic.label} — ${topic.description}` : topic.label}
                <button
                  type="button"
                  className={styles.TopicRemove}
                  onClick={() => removeTopic(topic.id)}
                  aria-label={t('Remove {{topic}}', { topic: topic.label })}
                >
                  <CloseIcon className={styles.TopicRemoveIcon} />
                </button>
              </span>
            ))}

            {/* the input lives inside the same box as the chips it adds to */}
            <div className={styles.TopicInputRow}>
              <Input
                type="text"
                placeholder={t('Type a topic to block… e.g. Politics — elections, parties, candidates')}
                field={{
                  name: 'newTopic',
                  value: draft,
                  onBlur: () => {},
                }}
                onChange={setDraft}
                inputProp={{
                  'data-testid': 'newTopicInput',
                  onKeyDown: (event: React.KeyboardEvent) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addFromDraft();
                    }
                  },
                }}
              />
              <Button
                variant="outlined"
                className={styles.TopicAddButton}
                onClick={addFromDraft}
                disabled={!draft.trim()}
                data-testid="addTopicButton"
              >
                <AddIcon className={styles.TopicAddIcon} />
                {t('Add')}
              </Button>
            </div>
          </div>
          <div className={styles.TopicsHelper}>{t('Press Enter or click + Add after typing.')}</div>

          {suggestedTopics.length > 0 && (
            <>
              <div className={styles.TopicsLabel}>{t('Suggested — click to add')}</div>
              <div className={styles.SuggestionRow}>
                {suggestedTopics.map((suggestion) => {
                  const added = isSuggestionAdded(suggestion);
                  return (
                    <button
                      type="button"
                      key={suggestion.id}
                      className={`${styles.Suggestion} ${added ? styles.SuggestionAdded : ''}`}
                      disabled={added}
                      onClick={() =>
                        addTopic({
                          id: `topic-${suggestion.id}`,
                          label: suggestion.label,
                          description: suggestion.description,
                        })
                      }
                      data-testid={`suggestedTopic-${suggestion.id}`}
                    >
                      {added ? (
                        <CheckIcon className={styles.SuggestionIcon} />
                      ) : (
                        <AddIcon className={styles.SuggestionIcon} />
                      )}
                      {suggestion.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className={styles.TopicsLabel}>{t('Set reply — sent when this guardrail is flagged')}</div>
          <Input
            type="text"
            textArea
            rows={2}
            placeholder={t('What should the assistant say when it blocks a message on this topic?')}
            field={{ name: 'setReply', value: setReply, onBlur: () => {} }}
            onChange={(text: string) => onChange({ ...value, setReply: text })}
            inputProp={{ 'data-testid': 'setReplyInput' }}
          />
          <div className={styles.TopicsLanguageNote}>
            <LanguageIcon className={styles.LanguageIcon} />
            {t(
              'Write this in any one language — AI automatically translates it to match the language the user wrote in (e.g. a Hindi message gets the reply in Hindi).'
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicsEditor;
