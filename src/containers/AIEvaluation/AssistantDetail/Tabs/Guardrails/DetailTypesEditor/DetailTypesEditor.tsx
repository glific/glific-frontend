import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';
import type { DetailTypesEditorProps } from 'containers/AIEvaluation/types/guardrailType';
import { GuardrailEditor } from '../GuardrailEditor/GuardrailEditor';
import styles from './DetailTypesEditor.module.css';

export const DetailTypesEditor = ({ groups, onChange }: DetailTypesEditorProps) => {
  const { t } = useTranslation();

  const allOptions = groups.flatMap((group) => group.options);
  const selectedCount = allOptions.filter((option) => option.selected).length;
  const summary =
    selectedCount === allOptions.length
      ? t('all {{count}} selected', { count: allOptions.length })
      : t('{{count}} selected', { count: selectedCount });

  const toggleOption = (groupId: string, optionId: string) => {
    onChange(
      groups.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              options: group.options.map((option) =>
                option.id === optionId ? { ...option, selected: !option.selected } : option
              ),
            }
      )
    );
  };

  const setGroupSelection = (groupId: string, selected: boolean) => {
    onChange(
      groups.map((group) =>
        group.id !== groupId ? group : { ...group, options: group.options.map((option) => ({ ...option, selected })) }
      )
    );
  };

  return (
    <GuardrailEditor summary={summary} toggleTestId="editDetailTypesToggle" bodyTestId="detailTypesEditorBody">
      {groups.map((group, index) => {
        const groupSelected = group.options.filter((option) => option.selected).length;

        return (
          <div className={styles.DetailGroup} key={group.id}>
            {/* the intro and each group's note share a line with that group's Select all / Clear */}
            <div className={styles.DetailGroupHeader}>
              <div className={styles.EditorIntro}>
                {index === 0 &&
                  t(
                    'Choose which kinds of personal details this check should look for. Works with sensible defaults even if you skip this.'
                  )}
                {group.note && <div>{t(group.note)}</div>}
              </div>
              <span className={styles.DetailGroupActions}>
                <button type="button" onClick={() => setGroupSelection(group.id, true)}>
                  {t('Select all')}
                </button>
                <button type="button" onClick={() => setGroupSelection(group.id, false)}>
                  {t('Clear')}
                </button>
              </span>
            </div>
            <div className={styles.DetailOptions}>
              {group.options.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={`${styles.DetailOption} ${option.selected ? styles.DetailOptionSelected : ''}`}
                  aria-pressed={option.selected}
                  onClick={() => toggleOption(group.id, option.id)}
                  data-testid={`detailOption-${option.id}`}
                >
                  <span className={styles.DetailOptionBox}>
                    {option.selected && <CheckIcon className={styles.DetailOptionCheck} />}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
            {groupSelected === 0 && (
              <div className={styles.DetailGroupNote}>{t('Nothing in this group is checked.')}</div>
            )}
          </div>
        );
      })}
    </GuardrailEditor>
  );
};

export default DetailTypesEditor;
