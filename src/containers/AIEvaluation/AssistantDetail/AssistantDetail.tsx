import { useMutation, useQuery } from '@apollo/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { SelectMenu } from 'components/UI/SelectMenu/SelectMenu';
import { Button } from 'components/UI/Form/Button/Button';
import { IconButton } from 'components/UI/IconButton/IconButton';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { setErrorMessage, setNotification } from 'common/notification';
import { copyToClipboard } from 'common/utils';
import { CREATE_ASSISTANT, SET_LIVE_VERSION, UPDATE_ASSISTANT } from 'graphql/mutations/Assistant';
import { GET_ASSISTANT, GET_ASSISTANT_VERSIONS } from 'graphql/queries/Assistant';
import CopyIcon from 'assets/images/CopyGreen.svg?react';
import BackIcon from 'assets/images/icons/BackIconFlow.svg?react';
import EditIcon from 'assets/images/icons/Edit.svg?react';
import type { resources } from 'i18n/config';
import type { AssistantVersion, ModelConfig } from 'containers/AIEvaluation/types/assistantType';
import { DEFAULT_MODEL_CONFIG } from './assistantModels';
import { PersonaPrompt } from './Tabs';
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

interface EditorState {
  prompt: string;
  config: ModelConfig;
}

const parseSettings = (settings: unknown): Record<string, unknown> => {
  if (typeof settings === 'string') {
    try {
      return JSON.parse(settings);
    } catch {
      return {};
    }
  }
  return (settings as Record<string, unknown>) ?? {};
};

const editorStateFromVersion = (version: AssistantVersion): EditorState => {
  const settings = parseSettings(version.settings);
  return {
    prompt: version.prompt ?? '',
    config: {
      ...DEFAULT_MODEL_CONFIG,
      model: version.model || DEFAULT_MODEL_CONFIG.model,
      temperature: settings.temperature != null ? String(settings.temperature) : DEFAULT_MODEL_CONFIG.temperature,
      ...(settings.effort ? { effort: settings.effort as ModelConfig['effort'] } : {}),
      ...(settings.verbosity ? { verbosity: settings.verbosity as ModelConfig['verbosity'] } : {}),
    },
  };
};

const editorStateFromAssistant = (assistant: any): EditorState => ({
  prompt: assistant.instructions ?? '',
  config: {
    ...DEFAULT_MODEL_CONFIG,
    model: assistant.model || DEFAULT_MODEL_CONFIG.model,
    temperature: assistant.temperature != null ? String(assistant.temperature) : DEFAULT_MODEL_CONFIG.temperature,
  },
});

export const AssistantDetail = () => {
  const { assistantId } = useParams<{ assistantId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('persona');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [modelConfig, setModelConfig] = useState<ModelConfig>(DEFAULT_MODEL_CONFIG);
  const [baseline, setBaseline] = useState<{ prompt: string; config: ModelConfig }>({
    prompt: '',
    config: DEFAULT_MODEL_CONFIG,
  });
  const [draftName, setDraftName] = useState('');
  const [discardOpen, setDiscardOpen] = useState(false);
  const [pendingVersionId, setPendingVersionId] = useState<string | null>(null);
  const [awaitingVersionAbove, setAwaitingVersionAbove] = useState<number | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const loadedKey = useRef<string | null>(null);

  const isCreateMode = !assistantId || assistantId === 'add';
  const defaultAssistantName = t('Untitled assistant');

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
  const [createAssistant, { loading: creating }] = useMutation(CREATE_ASSISTANT);
  const [setLiveVersion, { loading: publishing }] = useMutation(SET_LIVE_VERSION);

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

  useEffect(() => {
    const fetched = data?.assistant?.assistant;
    if (!fetched) return;

    const key = selectedVersion?.id ?? `assistant-${fetched.id}`;
    if (key === loadedKey.current) return;
    loadedKey.current = key;

    const loaded = selectedVersion ? editorStateFromVersion(selectedVersion) : editorStateFromAssistant(fetched);
    setPrompt(loaded.prompt);
    setModelConfig(loaded.config);
    setBaseline(loaded);
  }, [data, selectedVersion]);

  useEffect(() => {
    if (awaitingVersionAbove === null) return;
    const latest = [...(versionData?.assistantVersions ?? [])].sort(
      (a: AssistantVersion, b: AssistantVersion) => b.versionNumber - a.versionNumber
    )[0];
    if (!latest || latest.versionNumber <= awaitingVersionAbove) return;
    setSelectedVersionId(latest.id);
    setAwaitingVersionAbove(null);
  }, [awaitingVersionAbove, versionData]);

  const isDirty = prompt !== baseline.prompt || JSON.stringify(modelConfig) !== JSON.stringify(baseline.config);

  const handleDiscard = () => {
    setPrompt(baseline.prompt);
    setModelConfig(baseline.config);
    setDiscardOpen(false);
  };

  const handleSaveVersion = async () => {
    const temperature = Number(modelConfig.temperature);
    const input: Record<string, any> = {
      instructions: prompt,
      model: modelConfig.model,
      ...(modelConfig.temperature !== '' && Number.isFinite(temperature) ? { temperature } : {}),
    };

    try {
      if (isCreateMode) {
        input.name = draftName.trim() || defaultAssistantName;
        const response = await createAssistant({ variables: { input } });
        const errors = response.data?.createAssistant?.errors;
        if (errors?.length > 0) {
          setErrorMessage(errors[0]);
          return;
        }
        setNotification(t('Assistant created successfully'));
        navigate(`/ai-evaluation-v2/${response.data.createAssistant.assistant.id}`);
        return;
      }

      input.name = assistant.name;
      const response = await updateAssistant({
        variables: { updateAssistantId: assistantId, input },
        refetchQueries: [
          { query: GET_ASSISTANT, variables: { assistantId } },
          { query: GET_ASSISTANT_VERSIONS, variables: { assistantId } },
        ],
      });
      const errors = response.data?.updateAssistant?.errors;
      if (errors?.length > 0) {
        setErrorMessage(errors[0]);
        return;
      }
      setBaseline({ prompt, config: modelConfig });
      setAwaitingVersionAbove(sortedVersions[0]?.versionNumber ?? 0);
      setNotification(t('Changes saved successfully'));
    } catch (err: unknown) {
      setErrorMessage(err);
    }
  };

  const handleEditName = () => {
    setNameValue(isCreateMode ? draftName || defaultAssistantName : (assistant?.name ?? ''));
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmed = nameValue.trim();

    if (isCreateMode) {
      setDraftName(trimmed);
      setIsEditingName(false);
      return;
    }

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

  const handleSelectVersion = (versionId: string) => {
    if (versionId === selectedVersion?.id) return;
    // switching reloads the editor, which would silently throw away unsaved edits
    if (isDirty) {
      setPendingVersionId(versionId);
      return;
    }
    setSelectedVersionId(versionId);
  };

  const confirmSwitchVersion = () => {
    setSelectedVersionId(pendingVersionId);
    setPendingVersionId(null);
  };

  const handlePublish = async () => {
    if (!selectedVersion) return;

    try {
      const response = await setLiveVersion({
        variables: { assistantId, versionId: selectedVersion.id },
        refetchQueries: [{ query: GET_ASSISTANT_VERSIONS, variables: { assistantId } }],
      });
      const errors = response.data?.setLiveVersion?.errors;
      if (errors?.length > 0) {
        setErrorMessage(errors[0]);
        return;
      }
      setNotification(t('Version published — it is now live in your flows'));
    } catch (err: unknown) {
      setErrorMessage(err);
    }
  };

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

  const TAB_PANELS: Partial<Record<TabKey, ReactNode>> = {
    persona: (
      <PersonaPrompt prompt={prompt} config={modelConfig} onPromptChange={setPrompt} onConfigChange={setModelConfig} />
    ),
  };

  const activePanel = TAB_PANELS[activeTab];

  const statusPill = (version: AssistantVersion) =>
    version.isLive ? (
      <span className={styles.LivePill}>
        <span className={styles.LiveDot} />
        {t('LIVE')}
      </span>
    ) : (
      <span className={styles.DraftPill}>{t('Not published')}</span>
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
      <div className={styles.PageHeader} data-testid="heading">
        <div className={styles.HeaderLeft}>
          <button
            type="button"
            className={styles.BackButton}
            onClick={() => navigate('/ai-evaluation-v2')}
            aria-label={t('Back')}
            data-testid="back-button"
          >
            <BackIcon className={styles.BackIcon} />
          </button>
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
            <div className={styles.NameViewRow} data-testid="headerTitle">
              <span className={styles.NameText}>
                {isCreateMode ? draftName || defaultAssistantName : assistant.name}
              </span>
              <IconButton
                size="small"
                onClick={handleEditName}
                data-testid="editNameButton"
                className={styles.EditNameButton}
              >
                <EditIcon />
              </IconButton>
            </div>
          )}
        </div>

        {isDirty ? (
          <div className={styles.DirtyActions}>
            <span className={styles.UnsavedPill} data-testid="unsavedChanges">
              <span className={styles.UnsavedDot} />
              {t('Unsaved changes')}
            </span>
            <button
              type="button"
              className={styles.DiscardLink}
              onClick={() => setDiscardOpen(true)}
              data-testid="discardButton"
            >
              {t('Discard')}
            </button>
            <Button
              variant="contained"
              color="primary"
              className={styles.PublishButton}
              onClick={handleSaveVersion}
              loading={savingName || creating}
              data-testid="saveVersionButton"
            >
              {t('Save Version')}
            </Button>
          </div>
        ) : (
          !isCreateMode && (
            <Button
              variant="contained"
              color="primary"
              className={styles.PublishButton}
              onClick={handlePublish}
              loading={publishing}
              disabled={!selectedVersion || selectedVersion.isLive}
              data-testid="publishButton"
            >
              {t('Publish & Go Live')}
            </Button>
          )
        )}
      </div>

      {!isCreateMode && assistant.assistantId && (
        <span
          role="button"
          className={`${styles.AssistantId} ${isEditingName ? styles.AssistantIdEditing : ''}`}
          onClick={() => copyToClipboard(assistant.assistantId)}
          onKeyDown={() => copyToClipboard(assistant.assistantId)}
          tabIndex={0}
          data-testid="assistantId"
        >
          <CopyIcon />
          {assistant.assistantId}
        </span>
      )}

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

      <div className={activePanel ? styles.TabContent : styles.TabPanel} role="tabpanel" data-testid="tabPanel">
        {activePanel ?? `${t(activeTabLabel)} ${t('coming soon')}`}
      </div>

      {pendingVersionId && (
        <DialogBox
          title={t('Switch version?')}
          handleCancel={() => setPendingVersionId(null)}
          handleOk={confirmSwitchVersion}
          buttonOk={t('Switch version')}
          buttonCancel={t('Keep editing')}
          alignButtons="center"
          colorOk="warning"
        >
          <div className={styles.DiscardSubtitle}>
            {t('Loads the prompt and settings saved in that version into the editor.')}
          </div>
          <div className={styles.DiscardWarning}>{t('Any edits made since your last save will be lost.')}</div>
        </DialogBox>
      )}

      {discardOpen && (
        <DialogBox
          title={t('Discard unsaved changes?')}
          handleCancel={() => setDiscardOpen(false)}
          handleOk={handleDiscard}
          buttonOk={t('Discard changes')}
          buttonCancel={t('Keep editing')}
          alignButtons="center"
          colorOk="warning"
        >
          <div className={styles.DiscardSubtitle}>
            {t(
              "Reverts the prompt, model, settings and knowledge base back to what they were before you started editing. This can't be undone."
            )}
          </div>
          <div className={styles.DiscardWarning}>{t('Any edits made since your last save will be lost.')}</div>
        </DialogBox>
      )}
    </div>
  );
};

export default AssistantDetail;
