import { useMutation, useQuery } from '@apollo/client';
import { IconButton, Modal } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { Button } from 'components/UI/Form/Button/Button';

import { setErrorMessage } from 'common/notification';
import { copyToClipboard } from 'common/utils';

import { Heading } from 'components/UI/Heading/Heading';
import { Loading } from 'components/UI/Layout/Loading/Loading';

import { UPDATE_ASSISTANT } from 'graphql/mutations/Assistant';
import { GET_ASSISTANT } from 'graphql/queries/Assistant';

import CopyIcon from 'assets/images/CopyGreen.svg?react';
import BackIcon from 'assets/images/icons/BackIconFlow.svg?react';
import EditIcon from 'assets/images/icons/Edit.svg?react';

import type { AssistantVersion } from '../VersionPanel/VersionPanel';
import { VersionPanel } from '../VersionPanel/VersionPanel';
import { ConfigEditor } from './ConfigEditor';

import styles from './AssistantDetail.module.css';

export const AssistantDetail = () => {
  const { assistantId } = useParams<{ assistantId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [selectedVersion, setSelectedVersion] = useState<AssistantVersion | null>(null);
  const [versionRefetchTrigger, setVersionRefetchTrigger] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingVersion, setPendingVersion] = useState<AssistantVersion | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [updateAssistant, { loading: savingName }] = useMutation(UPDATE_ASSISTANT);

  const isCreateMode = assistantId === 'add';

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (!assistantId) {
      navigate('/assistants');
    }
  }, [assistantId]);

  const { loading, data } = useQuery(GET_ASSISTANT, {
    variables: { assistantId },
    fetchPolicy: 'network-only',
    skip: !assistantId || isCreateMode,
  });

  const assistantData = data?.assistant?.assistant;

  if (!assistantId) {
    return null;
  }

  // Only show full-page loading on initial fetch (no data yet)
  if (!isCreateMode && loading && !assistantData) {
    return <Loading />;
  }

  if (!isCreateMode && !assistantData) {
    return <p className={styles.NotFound}>{t('Assistant not found')}</p>;
  }

  const handleEditName = () => {
    setNameValue(assistantData?.name ?? '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === assistantData?.name) {
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

  const handleSaved = (newId?: string) => {
    if (isCreateMode && newId) {
      navigate(`/assistants/${newId}`);
      return;
    }
    setHasUnsavedChanges(false);
    setVersionRefetchTrigger((n) => n + 1);
  };

  const handleSelectVersion = (version: AssistantVersion) => {
    if (hasUnsavedChanges) {
      setPendingVersion(version);
    } else {
      setSelectedVersion(version);
    }
  };

  const confirmVersionSwitch = () => {
    if (pendingVersion) {
      setHasUnsavedChanges(false);
      setSelectedVersion(pendingVersion);
      setPendingVersion(null);
    }
  };

  const cancelVersionSwitch = () => {
    setPendingVersion(null);
  };

  return (
    <div className={styles.Page} data-testid="assistantDetailContainer">
      {isCreateMode ? (
        <Heading formTitle={t('Create New Assistant')} backLink="/assistants" />
      ) : (
        <div className={styles.PageHeader} data-testid="heading">
          <div className={styles.HeaderLeft}>
            <BackIcon className={styles.BackIcon} onClick={() => navigate('/assistants')} data-testid="back-button" />
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
                <span className={styles.NameText}>{assistantData?.name ?? ''}</span>
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
        </div>
      )}

      {!isCreateMode && assistantData?.assistantId && (
        <span
          role="button"
          data-testid="copyAssistantId"
          className={styles.AssistantId}
          onClick={() => copyToClipboard(assistantData.assistantId)}
          onKeyDown={() => copyToClipboard(assistantData.assistantId)}
          tabIndex={0}
        >
          <CopyIcon />
          {assistantData.assistantId}
        </span>
      )}

      {isCreateMode ? (
        <div className={styles.CreateWrapper}>
          <ConfigEditor
            assistantId=""
            assistantName=""
            newVersionInProgress={false}
            onSaved={handleSaved}
            onCancel={() => navigate('/assistants')}
            createMode
          />
        </div>
      ) : (
        /* Two-panel body */
        <div className={styles.Body}>
          <div className={styles.VersionPanelWrapper}>
            <VersionPanel
              assistantId={assistantId}
              selectedVersionId={selectedVersion?.id ?? null}
              onSelectVersion={handleSelectVersion}
              onRefetchSelect={setSelectedVersion}
              refetchTrigger={versionRefetchTrigger}
            />
          </div>
          <div className={styles.EditorWrapper}>
            {selectedVersion && assistantData ? (
              <ConfigEditor
                key={selectedVersion.id}
                assistantId={assistantId}
                assistantName={assistantData.name}
                version={selectedVersion}
                newVersionInProgress={assistantData.newVersionInProgress ?? false}
                onSaved={handleSaved}
                onUnsavedChange={setHasUnsavedChanges}
              />
            ) : (
              <p className={styles.EmptyText}>{t('Select a version to view and edit.')}</p>
            )}
          </div>
        </div>
      )}

      {/* Unsaved changes confirmation when switching versions */}
      {pendingVersion && (
        <Modal open onClose={cancelVersionSwitch}>
          <div className={styles.DialogBox}>
            <div className={styles.Dialog}>
              <h5 className={styles.DialogTitle}>{t('Unsaved changes')}</h5>
              <p className={styles.DialogBody}>{t('You have unsaved changes. Are you sure you want to leave?')}</p>
              <div className={styles.DialogActions}>
                <Button data-testid="version-switch-stay" onClick={cancelVersionSwitch} variant="outlined">
                  {t('Stay')}
                </Button>
                <Button
                  data-testid="version-switch-leave"
                  onClick={confirmVersionSwitch}
                  variant="contained"
                  color="error"
                >
                  {t('Leave')}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AssistantDetail;
