import { useQuery } from '@apollo/client';
import { Chip } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { GET_ASSISTANT_VERSIONS } from 'graphql/queries/Assistant';

import styles from './VersionPanel.module.css';

dayjs.extend(relativeTime);

export interface AssistantVectorStore {
  id: string;
  vectorStoreId: string;
  knowledgeBaseVersionId: string;
  name: string;
  legacy: boolean;
  size: number;
  files: Array<{ name: string; id: string; fileSize: number }>;
}

export interface AssistantVersion {
  id: string;
  versionNumber: number;
  model: string;
  prompt: string;
  settings: any;
  status: string;
  isLive: boolean;
  description?: string;
  insertedAt: string;
  updatedAt: string;
  vectorStore?: AssistantVectorStore | null;
}

interface VersionPanelProps {
  assistantId: string;
  selectedVersionId: string | null;
  onSelectVersion: (version: AssistantVersion) => void;
  onRefetchSelect?: (version: AssistantVersion) => void;
  refetchTrigger?: number;
  initialVersionNumber?: number;
}


const statusConfig: Record<string, { label: string; styleKey: string }> = {
  in_progress: { label: 'In Progress', styleKey: 'InProgress' },
  failed: { label: 'Failed', styleKey: 'Failed' },
};

export const VersionPanel = ({
  assistantId,
  selectedVersionId,
  onSelectVersion,
  onRefetchSelect,
  refetchTrigger = 0,
  initialVersionNumber,
}: VersionPanelProps) => {
  const { t } = useTranslation();
  const initialSelectionDone = useRef(false);
  const prevTrigger = useRef(0);

  const { data, refetch } = useQuery(GET_ASSISTANT_VERSIONS, {
    variables: { assistantId },
    fetchPolicy: 'network-only',
  });

  const versions: AssistantVersion[] = data?.assistantVersions ?? [];
  const sorted = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  // Initial auto-select: prefer version from URL param, fall back to live, then latest
  useEffect(() => {
    if (versions.length === 0 || initialSelectionDone.current) return;
    initialSelectionDone.current = true;
    const versionFromUrl = initialVersionNumber != null ? versions.find((v) => v.versionNumber === initialVersionNumber) : null;
    const target = versionFromUrl ?? versions.find((v) => v.isLive) ?? sorted[0];

    if (!target) return;

    if (versionFromUrl) {
      (onRefetchSelect ?? onSelectVersion)(target);
      return;
    }

    onSelectVersion(target);
  }, [data]);

  // Refetch when trigger changes, then select latest bypassing unsaved-changes guard
  useEffect(() => {
    if (refetchTrigger === 0 || refetchTrigger === prevTrigger.current) return;
    prevTrigger.current = refetchTrigger;
    refetch().then(({ data: newData }) => {
      if (!newData) return;
      const newVersions: AssistantVersion[] = newData.assistantVersions ?? [];
      const latest = [...newVersions].sort((a, b) => b.versionNumber - a.versionNumber)[0];
      if (latest) (onRefetchSelect ?? onSelectVersion)(latest);
    });
  }, [refetchTrigger]);

  return (
    <div className={styles.Container}>
      <div className={styles.List}>
        {sorted.length === 0 ? (
          <p className={styles.Empty}>{t('No versions found')}</p>
        ) : (
          sorted.map((version) => (
            <div
              key={version.id}
              data-testid="versionCard"
              className={`${styles.Card} ${selectedVersionId === version.id ? styles.Selected : ''}`}
              onClick={() => onSelectVersion(version)}
            >
              <div className={styles.CardHeader}>
                <div className={styles.CardLeft}>
                  <span className={styles.VersionNumber}>
                    {t('Version')} {version.versionNumber}
                  </span>
                  {version.isLive && (
                    <Chip data-testid="liveBadge" label={t('LIVE')} size="small" className={styles.LiveBadge} />
                  )}
                  {statusConfig[version.status] && (
                    <Chip
                      data-testid="versionStatus"
                      label={t(statusConfig[version.status].label as any)}
                      size="small"
                      className={`${styles.StatusChip} ${styles[statusConfig[version.status].styleKey]}`}
                    />
                  )}
                </div>
                <span className={styles.Time}>{dayjs(version.insertedAt).fromNow()}</span>
              </div>
              <span className={styles.Model}>
                {version.model}
                {version.description && (
                  <span className={styles.Description}> · {version.description}</span>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VersionPanel;
