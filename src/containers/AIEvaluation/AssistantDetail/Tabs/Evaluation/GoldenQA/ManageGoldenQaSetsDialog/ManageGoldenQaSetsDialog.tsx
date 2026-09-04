import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Button } from 'components/UI/Form/Button/Button';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import DocumentIcon from 'assets/images/icons/Document/Dark.svg?react';
import type { GoldenQaSet } from 'containers/AIEvaluation/types/goldenQaType';
import { goldenQaItemCount } from 'containers/AIEvaluation/utils/goldenQa/goldenQa';
import styles from './ManageGoldenQaSetsDialog.module.css';

dayjs.extend(relativeTime);

export interface ManageGoldenQaSetsDialogProps {
  sets: GoldenQaSet[];
  onView: (set: GoldenQaSet) => void;
  onAdd: () => void;
  onClose: () => void;
}

export const ManageGoldenQaSetsDialog = ({ sets, onView, onAdd, onClose }: ManageGoldenQaSetsDialogProps) => {
  const { t } = useTranslation();

  return (
    <DialogBox
      open
      titleAlign="left"
      title={t('Golden Q&A')}
      buttonOk={t('Done')}
      alignButtons="right"
      skipCancel
      handleOk={onClose}
      handleCancel={onClose}
      fullWidth
      customStyles={{ paper: styles.Paper }}
    >
      <div data-testid="manageGoldenQaSetsDialog">
        <div className={styles.Intro}>
          {t(
            'A fixed set of questions and their ideal answers. Every version is scored against the same set, so results stay comparable.'
          )}
        </div>

        <div className={styles.SetList} data-testid="goldenQaSetList">
          {sets.map((set) => {
            const items = goldenQaItemCount(set.totalItems);

            return (
              <button
                type="button"
                className={styles.Set}
                key={set.id}
                onClick={() => onView(set)}
                data-testid="manageGoldenQaSet"
              >
                <span className={styles.SetIcon}>
                  <DocumentIcon />
                </span>
                <span className={styles.SetText}>
                  <span className={styles.SetName}>{set.name}</span>
                  <span className={styles.Note}>
                    {t('Added')} {dayjs(set.insertedAt).fromNow()}
                    {items !== null && (
                      <span data-testid="goldenQaSetItems">
                        {' • '}
                        {items === 1 ? t('1 question') : t('{{count}} questions', { count: items })}
                      </span>
                    )}
                  </span>
                </span>
                <span className={styles.ViewLink}>
                  {t('View')}
                  <ArrowForwardIcon className={styles.ViewIcon} />
                </span>
              </button>
            );
          })}
        </div>

        <Button
          variant="outlined"
          className={styles.AddButton}
          startIcon={<AddIcon />}
          onClick={onAdd}
          data-testid="addGoldenQaSetButton"
        >
          {t('Add Golden Q&A')}
        </Button>
      </div>
    </DialogBox>
  );
};
