import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'react-i18next';
import { DropdownMenu } from 'components/UI/DropdownMenu/DropdownMenu';
import type { AssistantVersion } from 'containers/Assistants/VersionPanel/VersionPanel';
import styles from './VersionBar.module.css';

dayjs.extend(relativeTime);

// the evaluation score is not wired up yet — the chip keeps its place in the layout
const PLACEHOLDER_SCORE = '4.3';

export interface VersionBarProps {
  /** newest first — the dropdown lists them in this order */
  versions: AssistantVersion[];
  selectedVersion?: AssistantVersion;
  liveVersion?: AssistantVersion;
  onSelectVersion: (versionId: string) => void;
  /** a new assistant has no versions at all, so the bar explains that instead */
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

  const statusPill = (version: AssistantVersion) =>
    version.isLive ? (
      <span className={styles.LivePill}>
        <span className={styles.LiveDot} />
        {t('LIVE')}
      </span>
    ) : (
      <span className={styles.DraftPill}>{t('not published')}</span>
    );

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
            {liveVersion ? (
              <>
                <b>
                  {t('Version')} {liveVersion.versionNumber}
                </b>{' '}
                {t('is live in your flows')}
              </>
            ) : (
              t('Nothing published yet')
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VersionBar;
