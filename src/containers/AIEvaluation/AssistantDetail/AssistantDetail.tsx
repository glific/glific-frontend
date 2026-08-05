import { useMutation, useQuery } from '@apollo/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { SelectMenu } from 'components/UI/SelectMenu/SelectMenu';
import { Button } from 'components/UI/Form/Button/Button';
import { IconButton } from 'components/UI/IconButton/IconButton';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { setErrorMessage } from 'common/notification';
import { copyToClipboard } from 'common/utils';
import { UPDATE_ASSISTANT } from 'graphql/mutations/Assistant';
import { GET_ASSISTANT, GET_ASSISTANT_VERSIONS } from 'graphql/queries/Assistant';
import CopyIcon from 'assets/images/CopyGreen.svg?react';
import BackIcon from 'assets/images/icons/BackIconFlow.svg?react';
import EditIcon from 'assets/images/icons/Edit.svg?react';
import type { AssistantVersion } from 'containers/Assistants/VersionPanel/VersionPanel';
import type { resources } from 'i18n/config';
import styles from './AssistantDetail.module.css';

dayjs.extend(relativeTime);

type TranslationKey = keyof (typeof resources)['en']['translation'];

type TabKey = 'persona' | 'knowledgeBase' | 'guardrails' | 'evaluation' | 'tryItOut';

const TABS: { key: TabKey; label: TranslationKey; badge?: TranslationKey }[] = [
  { key: 'persona', label: 'Persona & Prompt' },
  { key: 'knowledgeBase', label: 'Knowledge Base' },
  { key: 'guardrails', label: 'Guardrails' },
  { key: 'evaluation', label: 'Golden Q&A Evaluation' },
  { key: 'tryItOut', label: 'Try It Out', badge: 'SANDBOX' },
];

const PLACEHOLDER_SCORE = '4.3';

export const AssistantDetail = () => {
  const { assistantId } = useParams<{ assistantId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TabKey>('persona');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // a brand new assistant has nothing to prefill, so we skip both fetches entirely
  const isCreateMode = !assistantId || assistantId === 'add';

  const { loading, data, error } = useQuery(GET_ASSISTANT, {
    variables: { assistantId },
    skip: isCreateMode,
    fetchPolicy: 'cache-and-network',
  });

  const { data: versionData } = useQuery(GET_ASSISTANT_VERSIONS, {
    variables: { assistantId },
    skip: isCreateMode,
    fetchPolicy: 'network-only',
  });

  const [updateAssistant, { loading: savingName }] = useMutation(UPDATE_ASSISTANT);

  const assistant = data?.assistant?.assistant;
  const versions: AssistantVersion[] = versionData?.assistantVersions ?? [];
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
  const liveVersion = versions.find((version) => version.isLive);

  // default to the live version, falling back to the latest one
  const selectedVersion =
    sortedVersions.find((version) => version.id === selectedVersionId) ?? liveVersion ?? sortedVersions[0];

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditingName]);

  const handleEditName = () => {
    setNameValue(assistant?.name ?? '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === assistant?.name) {
      setIsEditingName(false);
      return;
    }
    try {
      const response = await updateAssistant({
        variables: { updateAssistantId: assistantId, input: { name: trimmed } },
        refetchQueries: [{ query: GET_ASSISTANT, variables: { assistantId } }],
      });
      if (response.data?.updateAssistant?.errors?.length > 0) {
        setErrorMessage(response.data.updateAssistant.errors[0]);
        return;
      }
      setIsEditingName(false);
    } catch (err: unknown) {
      setErrorMessage(err);
    }
  };

  const handleSelectVersion = (versionId: string) => setSelectedVersionId(versionId);

  if (!isCreateMode && loading && !assistant) {
    return <Loading />;
  }

  if (!isCreateMode && (error || !assistant)) {
    return (
      <div className={styles.NotFound} data-testid="assistantNotFound">
        {t('Assistant not found')}
      </div>
    );
  }

  const activeTabLabel = (TABS.find((tab) => tab.key === activeTab) ?? TABS[0]).label;

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
    <div className={styles.Page} data-testid="assistantDetailContainer">
      <div className={styles.PageHeader}>
        <div className={styles.HeaderLeft}>
          <button
            type="button"
            className={styles.BackButton}
            onClick={() => navigate('/ai-evaluation-v2')}
            aria-label={t('Back')}
            data-testid="back-button"
          >
            <BackIcon />
          </button>
          <div className={styles.HeaderText}>
            {isEditingName ? (
              <div className={styles.NameEditRow}>
                <input
                  ref={nameInputRef}
                  className={styles.NameInput}
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  data-testid="nameInput"
                />
                <Button variant="contained" onClick={handleSaveName} loading={savingName} data-testid="saveNameButton">
                  {t('Save')}
                </Button>
                <Button variant="outlined" onClick={() => setIsEditingName(false)} data-testid="cancelNameButton">
                  {t('Cancel')}
                </Button>
              </div>
            ) : (
              <div className={styles.NameRow}>
                <span className={styles.NameText} data-testid="headerTitle">
                  {isCreateMode ? t('New Assistant') : assistant.name}
                </span>
                {!isCreateMode && (
                  <IconButton
                    size="small"
                    className={styles.EditNameButton}
                    onClick={handleEditName}
                    data-testid="editNameButton"
                  >
                    <EditIcon />
                  </IconButton>
                )}
              </div>
            )}
            {!isCreateMode && assistant.assistantId && (
              <span
                role="button"
                tabIndex={0}
                className={styles.AssistantId}
                onClick={() => copyToClipboard(assistant.assistantId)}
                onKeyDown={() => copyToClipboard(assistant.assistantId)}
                data-testid="assistantId"
              >
                <CopyIcon />
                {assistant.assistantId}
              </span>
            )}
          </div>
        </div>

        {!isCreateMode && (
          <Button variant="contained" color="primary" className={styles.PublishButton} data-testid="publishButton">
            {t('Publish & Go Live')}
          </Button>
        )}
      </div>

      <div className={styles.VersionBar} data-testid="versionBar">
        {isCreateMode || !selectedVersion ? (
          <span className={styles.NewAssistantPill} data-testid="newAssistantPill">
            {isCreateMode ? t('new assistant') : t('no version saved yet')}
          </span>
        ) : (
          <>
            <SelectMenu
              testId="versionPill"
              triggerClassName={`${styles.VersionPill} ${selectedVersion.isLive ? styles.VersionPillLive : ''}`}
              paperClassName={styles.VersionMenuPaper}
              header={t('Versions')}
              footer={t('Saving creates a minor version. Publishing promotes it to the next major and makes it live.')}
              selectedId={selectedVersion.id}
              onSelect={(option) => handleSelectVersion(option.id)}
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
              options={sortedVersions.map((version) => ({
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

      <div className={styles.Tabs} role="tablist">
        {TABS.map((tab) => (
          <button
            type="button"
            role="tab"
            key={tab.key}
            aria-selected={activeTab === tab.key}
            className={`${styles.Tab} ${activeTab === tab.key ? styles.ActiveTab : ''}`}
            onClick={() => setActiveTab(tab.key)}
            data-testid={`tab-${tab.key}`}
          >
            {t(tab.label)}
            {tab.badge && <span className={styles.SandboxBadge}>{t(tab.badge)}</span>}
          </button>
        ))}
      </div>

      <div className={styles.TabPanel} role="tabpanel" data-testid="tabPanel">
        {t(activeTabLabel)} {t('coming soon')}
      </div>
    </div>
  );
};

export default AssistantDetail;
