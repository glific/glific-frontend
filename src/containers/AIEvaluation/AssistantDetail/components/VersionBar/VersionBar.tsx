import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'react-i18next';
import { DropdownMenu } from 'components/UI/DropdownMenu/DropdownMenu';
import type { AssistantVersion } from 'containers/Assistants/VersionPanel/VersionPanel';
import styles from './VersionBar.module.css';

dayjs.extend(relativeTime);

const PLACEHOLDER_SCORE = '4.3';

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
    version.isLive ? (
      <span className={styles.LivePill}>
        <span className={styles.LiveDot} />
        {t('LIVE')}
      </span>
    ) : (
      <span className={styles.DraftPill}>{t('not published')}</span>
    );

  const buildPill = (version: AssistantVersion) => {
    if (version.status === 'in_progress') {
      return (
        <span className={styles.InProgressPill} data-testid={`inProgressPill-${version.versionNumber}`}>
          <span className={styles.InProgressDot} />
          {t('In Progress')}
        </span>
      );
    }

    if (version.status === 'failed') {
      return (
        <span className={styles.FailedPill} data-testid={`failedPill-${version.versionNumber}`}>
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
          {t('Version')} {liveVersion.versionNumber}
        </b>{' '}
        {t('is live in your flows')}
      </>
    );
  };

  const versionMeta = (version: AssistantVersion) => {
    const when = version.isLive ? t('published') : t('saved');
    const timestamp = version.updatedAt ?? version.insertedAt;
    return [version.description, timestamp ? `${when} ${dayjs(timestamp).fromNow()}` : null]
      .filter(Boolean)
      .join(' · ');
  };

  return (
    <div className={styles.VersionBar} data-testid="versionBar">
      {isCreateMode || !selectedVersion ? (
        <>
          {isCreateMode && (
            <span className={styles.NewAssistantPill} data-testid="newAssistantPill">
              <span className={styles.NewAssistantDot} />
              {t('new assistant')}
            </span>
          )}
          <span className={styles.NoVersionPill} data-testid="noVersionPill">
            {t('no version saved yet')}
          </span>
          <div className={styles.LiveNote} data-testid="liveNote">
            {t('Nothing published yet')}
          </div>
        </>
      ) : (
        <>
          <DropdownMenu
            testId="versionPill"
            triggerClassName={`${styles.VersionPill} ${selectedVersion.isLive ? styles.VersionPillLive : ''}`}
            paperClassName={styles.VersionMenuPaper}
            header={t('Versions')}
            footer={t('Saving creates a minor version. Publishing promotes it to the next major and makes it live.')}
            selectedId={selectedVersion.id}
            onSelect={(option) => onSelectVersion(option.id)}
            trigger={
              <>
                <span className={`${styles.VersionLabel} ${selectedVersion.isLive ? styles.VersionLabelLive : ''}`}>
                  {t('Version')} {selectedVersion.versionNumber}
                </span>
                {statusPill(selectedVersion)}
                <span className={styles.CaretBox}>
                  <span className={styles.Caret} />
                </span>
              </>
            }
            options={versions.map((version) => ({
              id: version.id,
              testId: `versionOption-${version.versionNumber}`,
              startAdornment: (
                <span className={`${styles.VersionDot} ${version.isLive ? styles.VersionDotLive : ''}`} />
              ),
              label: (
                <span className={`${styles.VersionLabel} ${version.isLive ? styles.VersionLabelLive : ''}`}>
                  {t('Version')} {version.versionNumber}
                </span>
              ),
              endAdornment: statusPill(version),
              description: versionMeta(version),
            }))}
          />

          <div className={styles.HealthChip} data-testid="healthChip">
            <span className={styles.HealthTick}>✓</span>
            {t('Good')}
            <b className={styles.HealthScore}>{PLACEHOLDER_SCORE}</b>
            <small className={styles.HealthTotal}>/5</small>
          </div>

          <div className={styles.LiveNote} data-testid="liveNote">
            {statusNote() && <>{statusNote()} · </>}
            {liveNote()}
          </div>
        </>
      )}
    </div>
  );
};

export default VersionBar;
