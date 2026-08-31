import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'react-i18next';
import type { SelectMenuOption } from 'components/UI/SelectMenu/SelectMenu';
import { SelectMenu } from 'components/UI/SelectMenu/SelectMenu';
import type { AssistantVersion } from 'containers/AIEvaluation/types/assistantType';
import { LivePill } from '../LivePill/LivePill';
import styles from './VersionBar.module.css';

dayjs.extend(relativeTime);

export const canPublishVersion = (version?: AssistantVersion) =>
  Boolean(version) && !version?.isLive && version?.status !== 'in_progress' && version?.status !== 'failed';

export interface VersionBarProps {
  versions: AssistantVersion[];
  selectedVersion?: AssistantVersion;
  liveVersion?: AssistantVersion;
  onSelectVersion: (versionId: string) => void;
  isCreateMode?: boolean;
}

export const VersionBar = ({
  versions,
  selectedVersion,
  liveVersion,
  onSelectVersion,
  isCreateMode = false,
}: VersionBarProps) => {
  const { t } = useTranslation();

  const publishPill = (version: AssistantVersion) =>
    version.isLive ? <LivePill /> : <span className={styles.DraftPill}>{t('Not published')}</span>;

  const buildPill = (version: AssistantVersion) => {
    if (version.status === 'in_progress') {
      return (
        <span className={styles.InProgressPill} data-testid={`inProgressPill-${version.versionLabel}`}>
          <span className={styles.InProgressDot} />
          {t('In Progress')}
        </span>
      );
    }

    if (version.status === 'failed') {
      return (
        <span className={styles.FailedPill} data-testid={`failedPill-${version.versionLabel}`}>
          {t('Failed')}
        </span>
      );
    }

    return null;
  };

  const statusPill = (version: AssistantVersion) => (
    <span className={styles.PillGroup}>
      {publishPill(version)}
      {buildPill(version)}
    </span>
  );

  const statusNote = () => {
    if (selectedVersion?.status === 'in_progress') return t('This version is still being prepared');
    if (selectedVersion?.status === 'failed') return t('Cannot set a failed version as live');
    return null;
  };

  const liveNote = () => {
    if (!liveVersion) return t('Nothing published yet');
    return (
      <>
        <b>
          {t('Version')} {liveVersion.versionLabel}
        </b>{' '}
        {t('is live in your flows')}
      </>
    );
  };

  const versionMeta = (version: AssistantVersion) => {
    const when = version.isLive ? t('published') : t('saved');
    const timestamp = version.updatedAt ?? version.insertedAt;
    return timestamp ? `${when} ${dayjs(timestamp).fromNow()}` : '';
  };

  return (
    <div className={styles.VersionBar} data-testid="versionBar">
      {isCreateMode || !selectedVersion ? (
        <>
          {isCreateMode && (
            <span className={styles.NewAssistantPill} data-testid="newAssistantPill">
              <span className={styles.NewAssistantDot} />
              {t('New assistant')}
            </span>
          )}
          <span className={styles.NoVersionPill} data-testid="noVersionPill">
            {t('No version saved yet')}
          </span>
          <div className={styles.LiveNote} data-testid="liveNote">
            {t('Nothing published yet')}
          </div>
        </>
      ) : (
        <>
          <SelectMenu
            testId="versionPill"
            triggerClassName={`${styles.VersionPill} ${selectedVersion.isLive ? styles.VersionPillLive : ''}`}
            paperClassName={styles.VersionMenuPaper}
            header={t('Versions')}
            footer={t('Saving creates a minor version. Publishing promotes it to the next major and makes it live.')}
            selectedId={selectedVersion.id}
            onSelect={(option: SelectMenuOption) => onSelectVersion(option.id)}
            trigger={
              <>
                <span className={`${styles.VersionLabel} ${selectedVersion.isLive ? styles.VersionLabelLive : ''}`}>
                  {t('Version')} {selectedVersion.versionLabel}
                </span>
                {statusPill(selectedVersion)}
                <span className={styles.CaretBox}>
                  <span className={styles.Caret} />
                </span>
              </>
            }
            options={versions.map((version) => ({
              id: version.id,
              testId: `versionOption-${version.versionLabel}`,
              startAdornment: (
                <span className={`${styles.VersionDot} ${version.isLive ? styles.VersionDotLive : ''}`} />
              ),
              label: (
                <span className={`${styles.VersionLabel} ${version.isLive ? styles.VersionLabelLive : ''}`}>
                  {t('Version')} {version.versionLabel}
                </span>
              ),
              endAdornment: statusPill(version),
              description: versionMeta(version),
            }))}
          />

          <div className={styles.LiveNote} data-testid="liveNote">
            {statusNote() && <>{statusNote()} · </>}
            {liveNote()}
          </div>
        </>
      )}
    </div>
  );
};
