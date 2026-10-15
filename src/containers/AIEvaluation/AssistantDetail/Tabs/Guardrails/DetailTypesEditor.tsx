import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { GuardrailDetailGroup } from 'containers/AIEvaluation/types/guardrailType';
import styles from './Guardrails.module.css';

export interface DetailTypesEditorProps {
  groups: GuardrailDetailGroup[];
  onChange: (groups: GuardrailDetailGroup[]) => void;
}

export const DetailTypesEditor = ({ groups, onChange }: DetailTypesEditorProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

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
    <div className={styles.Editor}>
      <button
        type="button"
        className={styles.EditToggle}
        onClick={() => setExpanded((open) => !open)}
        data-testid="editDetailTypesToggle"
      >
        <EditOutlinedIcon className={styles.EditIcon} />
        {t('Configure')}
        <span className={styles.EditSummary}>· {summary}</span>
        {expanded ? <ExpandMoreIcon className={styles.EditCaret} /> : <ChevronRightIcon className={styles.EditCaret} />}
      </button>

      {expanded && (
        <div className={styles.EditorBody} data-testid="detailTypesEditorBody">
          <div className={styles.EditorIntro}>
            {t(
              'Choose which kinds of personal details this check should look for. Works with sensible defaults even if you skip this.'
            )}
          </div>

          {groups.map((group) => {
            const groupSelected = group.options.filter((option) => option.selected).length;

            return (
              <div className={styles.DetailGroup} key={group.id}>
                <div className={styles.DetailGroupHeader}>
                  {group.label && (
                    <span className={styles.DetailGroupLabel}>
                      {group.label} ({group.options.length})
                    </span>
                  )}
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
        </div>
      )}
    </div>
  );
};

export default DetailTypesEditor;
