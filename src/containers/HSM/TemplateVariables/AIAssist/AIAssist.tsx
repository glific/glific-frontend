import { useEffect, useRef, useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  Button,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

import { setErrorMessage } from 'common/notification';
import { setDefaultValue } from 'common/RichEditor';

import { REPHRASE_TEMPLATE_BODY } from 'graphql/mutations/TemplateRephrase';
import { TEMPLATE_REPHRASE } from 'graphql/queries/TemplateRephrase';

import styles from './AIAssist.module.css';

export interface AIAssistProps {
  body: string;
  disabled?: boolean;
}

type RephraseAction = 'PROFESSIONAL' | 'UTILITY' | 'CUSTOM';

type Phase = 'idle' | 'generating' | 'error';

const POLL_INTERVAL = 2000;
const MAX_POLL_DURATION = 20000;

export const AIAssist = ({ body, disabled }: AIAssistProps) => {
  const { t } = useTranslation();
  const [editor] = useLexicalComposerContext();

  const [phase, setPhase] = useState<Phase>('idle');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [customAnchorEl, setCustomAnchorEl] = useState<null | HTMLElement>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const requestedTextRef = useRef('');
  const bodyRef = useRef(body);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    bodyRef.current = body;
  }, [body]);

  const isMenuOpen = Boolean(anchorEl);
  const isCustomPromptOpen = Boolean(customAnchorEl);
  const isGenerating = phase === 'generating';
  const isTriggerDisabled = Boolean(disabled) || !body?.trim() || isGenerating;

  const [rephraseTemplateBody] = useMutation(REPHRASE_TEMPLATE_BODY);
  const [pollTemplateRephrase, { data: pollData, error: pollError, stopPolling, startPolling }] = useLazyQuery(
    TEMPLATE_REPHRASE,
    {
      fetchPolicy: 'network-only',
    }
  );

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleFailure = (message: string) => {
    clearTimers();
    stopPolling();
    setErrorMessage(message);
    setPhase('error');
    setPhase('idle');
  };

  const handleReady = (rephrasedText?: string | null) => {
    clearTimers();
    stopPolling();

    if (!rephrasedText?.trim()) {
      handleFailure(t('AI Assist could not rephrase this message. Please try again.'));
      return;
    }

    if (bodyRef.current !== requestedTextRef.current) {
      setErrorMessage(t('The message was edited while AI Assist was working, so the result was discarded.'));
      setPhase('idle');
      return;
    }

    setDefaultValue(editor, rephrasedText);
    setPhase('idle');
  };

  useEffect(() => {
    const result = pollData?.templateRephrase?.templateRephrase;
    if (!result) return;
    if (result.status === 'ready') {
      handleReady(result.rephrasedText);
    } else if (result.status === 'failed') {
      handleFailure(result.errorMessage || t('AI Assist failed. Please try again.'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollData]);

  useEffect(() => {
    if (pollError) {
      setErrorMessage(pollError);
      handleFailure(t('AI Assist failed. Please try again.'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollError]);

  useEffect(
    () => () => {
      clearTimers();
      stopPolling();
    },
    []
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCustomPromptClose = () => {
    setCustomAnchorEl(null);
    setCustomPrompt('');
  };

  const openCustomPrompt = () => {
    handleMenuClose();
    setCustomAnchorEl(triggerRef.current);
  };

  const dispatchRephrase = async (action: RephraseAction, actionCustomPrompt?: string) => {
    handleMenuClose();
    handleCustomPromptClose();

    if (isTriggerDisabled) return;

    requestedTextRef.current = body;
    setPhase('generating');

    try {
      const { data } = await rephraseTemplateBody({
        variables: { input: { text: body, action, customPrompt: actionCustomPrompt || null } },
      });
      const result = data?.rephraseTemplateBody?.templateRephrase;
      const errors = data?.rephraseTemplateBody?.errors;

      if (errors && errors.length > 0) {
        handleFailure(errors[0].message || t('AI Assist failed. Please try again.'));
        return;
      }
      if (!result?.id) {
        handleFailure(t('AI Assist failed. Please try again.'));
        return;
      }
      if (result.status === 'ready') {
        handleReady(result.rephrasedText);
        return;
      }
      if (result.status === 'failed') {
        handleFailure(result.errorMessage || t('AI Assist failed. Please try again.'));
        return;
      }

      pollTemplateRephrase({ variables: { id: result.id } });
      startPolling(POLL_INTERVAL);
      timeoutRef.current = setTimeout(() => {
        handleFailure(t('AI Assist timed out. Please try again.'));
      }, MAX_POLL_DURATION);
    } catch (error) {
      setErrorMessage(error);
      handleFailure(t('AI Assist failed. Please try again.'));
    }
  };

  const handleCustomPromptSubmit = () => {
    if (!customPrompt.trim()) return;
    dispatchRephrase('CUSTOM', customPrompt.trim());
  };

  return (
    <div className={styles.AIAssist}>
      <Button
        ref={triggerRef}
        variant="outlined"
        color="primary"
        className={styles.AIAssistButton}
        onClick={handleMenuOpen}
        onMouseDown={(event: any) => event.preventDefault()}
        disabled={isTriggerDisabled}
        endIcon={isGenerating ? undefined : <ExpandMoreIcon />}
        data-testid="ai-assist-button"
      >
        {isGenerating ? (
          <CircularProgress size={16} data-testid="ai-assist-loading" />
        ) : (
          <AutoAwesomeIcon fontSize="small" />
        )}
        <span className={styles.AIAssistLabel}>{t('AI Assist')}</span>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { minWidth: 220, mt: 0.5 } } }}
      >
        <MenuItem onClick={() => dispatchRephrase('PROFESSIONAL')} data-testid="ai-assist-professional">
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('Make it sound professional')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => dispatchRephrase('UTILITY')} data-testid="ai-assist-utility">
          <ListItemIcon>
            <CheckBoxIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('Make it utility')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={openCustomPrompt} data-testid="ai-assist-custom">
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('Custom prompt')}</ListItemText>
        </MenuItem>
      </Menu>

      <Popover
        open={isCustomPromptOpen}
        anchorEl={customAnchorEl}
        onClose={handleCustomPromptClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { minWidth: 280, p: 2 } } }}
      >
        <div className={styles.CustomPromptContainer}>
          <TextField
            autoFocus
            multiline
            minRows={3}
            fullWidth
            placeholder={t('e.g. Make it sound more casual')}
            value={customPrompt}
            onChange={(event) => setCustomPrompt(event.target.value)}
            data-testid="ai-assist-custom-prompt-input"
          />
          <Button
            variant="contained"
            color="primary"
            className={styles.CustomPromptSubmit}
            disabled={!customPrompt.trim()}
            onClick={handleCustomPromptSubmit}
            data-testid="ai-assist-custom-prompt-submit"
          >
            {t('Rephrase')}
          </Button>
        </div>
      </Popover>
    </div>
  );
};
