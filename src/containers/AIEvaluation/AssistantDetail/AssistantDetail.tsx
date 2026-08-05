import { useMutation, useQuery } from '@apollo/client';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { Loading } from 'components/UI/Layout/Loading/Loading';
import { setErrorMessage, setNotification } from 'common/notification';
import {
  CREATE_ASSISTANT,
  CREATE_KNOWLEDGE_BASE,
  SET_LIVE_VERSION,
  UPDATE_ASSISTANT,
} from 'graphql/mutations/Assistant';
import { GET_ASSISTANT, GET_ASSISTANT_VERSIONS } from 'graphql/queries/Assistant';
import type { AssistantVersion } from 'containers/Assistants/VersionPanel/VersionPanel';
import { DEFAULT_MODEL_CONFIG, ModelConfig } from './assistantModels';
import {
  AssistantHeader,
  DiscardDialog,
  HeaderActions,
  LeaveDialog,
  SwitchVersionDialog,
  TABS,
  TabBar,
  TabKey,
  VersionBar,
} from './components';
import { KnowledgeBase, PersonaPrompt } from './Tabs';
import type { KnowledgeBaseFile } from './Tabs/KnowledgeBase/KnowledgeBase';
import styles from './AssistantDetail.module.css';

const LIST_PATH = '/ai-evaluation-v2';

interface EditorState {
  prompt: string;
  config: ModelConfig;
  files: KnowledgeBaseFile[];
}

// settings comes back as a JSON scalar — sometimes already parsed, sometimes a string
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

const filesFromVectorStore = (vectorStore: { files?: { id: string; name: string; fileSize?: number }[] } | null) =>
  (vectorStore?.files ?? []).map((file) => ({
    fileId: file.id,
    filename: file.name,
    fileSize: file.fileSize,
  }));

// a version carries its own vector store, but older ones can come back without one — fall
// back to the assistant's so the knowledge base does not look empty
const editorStateFromVersion = (version: AssistantVersion, assistant: any): EditorState => {
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
    files: filesFromVectorStore(version.vectorStore ?? assistant?.vectorStore ?? null),
  };
};

// fallback for an assistant that has no versions yet
const editorStateFromAssistant = (assistant: any): EditorState => ({
  prompt: assistant.instructions ?? '',
  config: {
    ...DEFAULT_MODEL_CONFIG,
    model: assistant.model || DEFAULT_MODEL_CONFIG.model,
    temperature: assistant.temperature != null ? String(assistant.temperature) : DEFAULT_MODEL_CONFIG.temperature,
  },
  files: filesFromVectorStore(assistant.vectorStore ?? null),
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
  const [knowledgeBaseFiles, setKnowledgeBaseFiles] = useState<KnowledgeBaseFile[]>([]);
  const [baseline, setBaseline] = useState<{ prompt: string; config: ModelConfig; files: KnowledgeBaseFile[] }>({
    prompt: '',
    config: DEFAULT_MODEL_CONFIG,
    files: [],
  });
  const [draftName, setDraftName] = useState('');
  const [discardOpen, setDiscardOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  // set while the user confirms losing unsaved edits to switch version
  const [pendingVersionId, setPendingVersionId] = useState<string | null>(null);
  // highest version number seen when a save started — the refetch is done once one beats it
  const [awaitingVersionAbove, setAwaitingVersionAbove] = useState<number | null>(null);
  // one flag for the whole save sequence — the knowledge-base rebuild has no loading state
  // of its own, and it is the slowest step
  const [saving, setSaving] = useState(false);
  // guards against a refetch of the same version wiping what the user is typing
  const loadedKey = useRef<string | null>(null);

  // a brand new assistant has nothing to prefill, so we skip both fetches entirely
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
  const [createAssistant] = useMutation(CREATE_ASSISTANT);
  const [setLiveVersion, { loading: publishing }] = useMutation(SET_LIVE_VERSION);
  const [createKnowledgeBase] = useMutation(CREATE_KNOWLEDGE_BASE);

  const assistant = data?.assistant?.assistant;
  const versions: AssistantVersion[] = versionData?.assistantVersions ?? [];
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
  const liveVersion = versions.find((version) => version.isLive);

  // default to the live version, falling back to the latest one
  const selectedVersion =
    sortedVersions.find((version) => version.id === selectedVersionId) ?? liveVersion ?? sortedVersions[0];

  // the selected version drives the editor: picking another one loads its prompt, settings
  // and knowledge-base files
  useEffect(() => {
    const fetched = data?.assistant?.assistant;
    if (!fetched) return;

    const key = selectedVersion?.id ?? `assistant-${fetched.id}`;
    if (key === loadedKey.current) return;
    loadedKey.current = key;

    const loaded = selectedVersion
      ? editorStateFromVersion(selectedVersion, fetched)
      : editorStateFromAssistant(fetched);
    setPrompt(loaded.prompt);
    setModelConfig(loaded.config);
    setKnowledgeBaseFiles(loaded.files);
    setBaseline(loaded);
  }, [data, selectedVersion]);

  // a fresh save lands as the newest version, so move the selection onto it. The refetch can
  // still be in flight when the mutation resolves, so wait for a higher number to show up.
  useEffect(() => {
    if (awaitingVersionAbove === null) return;
    const latest = [...(versionData?.assistantVersions ?? [])].sort(
      (a: AssistantVersion, b: AssistantVersion) => b.versionNumber - a.versionNumber
    )[0];
    if (!latest || latest.versionNumber <= awaitingVersionAbove) return;
    setSelectedVersionId(latest.id);
    setAwaitingVersionAbove(null);
  }, [awaitingVersionAbove, versionData]);

  const filesChanged = JSON.stringify(knowledgeBaseFiles) !== JSON.stringify(baseline.files);

  const dirtyTabs: Partial<Record<TabKey, boolean>> = {
    persona: prompt !== baseline.prompt || JSON.stringify(modelConfig) !== JSON.stringify(baseline.config),
    knowledgeBase: filesChanged,
  };
  const isDirty = Object.values(dirtyTabs).some(Boolean);

  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const leavePage = () => navigate(LIST_PATH);

  const handleBack = () => {
    if (isDirty) {
      setLeaveOpen(true);
      return;
    }
    leavePage();
  };

  const handleDiscard = () => {
    setPrompt(baseline.prompt);
    setModelConfig(baseline.config);
    setKnowledgeBaseFiles(baseline.files);
    setDiscardOpen(false);
  };

  const handleSaveVersion = async () => {
    setSaving(true);
    const temperature = Number(modelConfig.temperature);
    const input: Record<string, any> = {
      instructions: prompt,
      model: modelConfig.model,
      ...(modelConfig.temperature !== '' && Number.isFinite(temperature) ? { temperature } : {}),
    };

    try {
      // the files were uploaded when picked; this is what actually attaches them
      if (filesChanged) {
        const knowledgeBaseResponse = await createKnowledgeBase({
          variables: {
            createKnowledgeBaseId: assistant?.vectorStore?.id ?? null,
            mediaInfo: knowledgeBaseFiles,
          },
        });
        const versionId = knowledgeBaseResponse.data?.createKnowledgeBase?.knowledgeBase?.knowledgeBaseVersionId;
        if (versionId) input.knowledgeBaseVersionId = versionId;
      }

      if (isCreateMode) {
        input.name = draftName.trim() || defaultAssistantName;
        const response = await createAssistant({ variables: { input } });
        const errors = response.data?.createAssistant?.errors;
        if (errors?.length > 0) {
          setErrorMessage(errors[0]);
          return;
        }
        setNotification(t('Assistant created successfully'));
        navigate(`${LIST_PATH}/${response.data.createAssistant.assistant.id}`);
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
      setBaseline({ prompt, config: modelConfig, files: knowledgeBaseFiles });
      setAwaitingVersionAbove(sortedVersions[0]?.versionNumber ?? 0);
      setNotification(t('Changes saved successfully'));
    } catch (err: unknown) {
      setErrorMessage(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditName = () => {
    setNameValue(isCreateMode ? draftName || defaultAssistantName : (assistant?.name ?? ''));
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmed = nameValue.trim();

    // nothing exists to rename yet on a new assistant — the name is sent with the first save
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
  const vectorStore = selectedVersion?.vectorStore ?? assistant?.vectorStore;

  // a tab appears here once it is built; anything missing falls through to "coming soon"
  const TAB_PANELS: Partial<Record<TabKey, ReactNode>> = {
    persona: (
      <PersonaPrompt prompt={prompt} config={modelConfig} onPromptChange={setPrompt} onConfigChange={setModelConfig} />
    ),
    knowledgeBase: (
      <KnowledgeBase
        files={knowledgeBaseFiles}
        onFilesChange={setKnowledgeBaseFiles}
        vectorStoreId={vectorStore?.vectorStoreId ?? null}
        legacy={vectorStore?.legacy ?? false}
      />
    ),
  };

  const activePanel = TAB_PANELS[activeTab];

  return (
    <div className={styles.Page} data-testid="assistantDetailContainer">
      <AssistantHeader
        name={isCreateMode ? draftName || defaultAssistantName : assistant.name}
        assistantId={isCreateMode ? null : assistant.assistantId}
        isEditingName={isEditingName}
        nameValue={nameValue}
        savingName={savingName}
        onNameChange={setNameValue}
        onEditName={handleEditName}
        onSaveName={handleSaveName}
        onCancelName={() => setIsEditingName(false)}
        onBack={handleBack}
        actions={
          <HeaderActions
            isDirty={isDirty}
            saving={saving}
            onDiscard={() => setDiscardOpen(true)}
            onSave={handleSaveVersion}
            showPublish={!isCreateMode}
            publishing={publishing}
            publishDisabled={!selectedVersion || selectedVersion.isLive}
            onPublish={handlePublish}
          />
        }
      />

      <VersionBar
        versions={sortedVersions}
        selectedVersion={selectedVersion}
        liveVersion={liveVersion}
        onSelectVersion={handleSelectVersion}
        isCreateMode={isCreateMode}
      />

      <TabBar activeTab={activeTab} onChange={setActiveTab} dirtyTabs={dirtyTabs} />

      <div className={activePanel ? styles.TabContent : styles.TabPanel} role="tabpanel" data-testid="tabPanel">
        {activePanel ?? `${t(activeTabLabel)} ${t('coming soon')}`}
      </div>

      {leaveOpen && <LeaveDialog onConfirm={leavePage} onCancel={() => setLeaveOpen(false)} />}

      {discardOpen && <DiscardDialog onConfirm={handleDiscard} onCancel={() => setDiscardOpen(false)} />}

      {pendingVersionId && (
        <SwitchVersionDialog onConfirm={confirmSwitchVersion} onCancel={() => setPendingVersionId(null)} />
      )}
    </div>
  );
};

export default AssistantDetail;
