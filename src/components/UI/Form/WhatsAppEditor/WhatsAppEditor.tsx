import { useCallback } from 'react';
import { RichUtils, getDefaultKeyBinding, Modifier, EditorState, Editor } from 'draft-js';
import { useResizeDetector } from 'react-resize-detector';
import { useTranslation } from 'react-i18next';

import { getPlainTextFromEditor } from 'common/RichEditor';
import styles from './WhatsAppEditor.module.css';

interface WhatsAppEditorProps {
  handleHeightChange(newHeight: number): void;
  sendMessage(message: string): void;
  editorState: any;
  setEditorState(editorState: any): void;
  readOnly?: boolean;
}

export const updatedValue = (input: any, editorState: EditorState, isEmoji: boolean = false) => {
  const editorContentState = editorState.getCurrentContent();
  const editorSelectionState: any = editorState.getSelection();
  const ModifiedContent = Modifier.replaceText(
    editorContentState,
    editorSelectionState,
    isEmoji ? input.native : input
  );
  let updatedEditorState = EditorState.push(editorState, ModifiedContent, 'insert-characters');
  if (!isEmoji) {
    const editorSelectionStateMod = updatedEditorState.getSelection();
    const updatedSelection = editorSelectionStateMod.merge({
      anchorOffset: editorSelectionStateMod.getAnchorOffset() - 1,
      focusOffset: editorSelectionStateMod.getFocusOffset() - 1,
    });
    updatedEditorState = EditorState.forceSelection(updatedEditorState, updatedSelection);
  }

  return updatedEditorState;
};

export const WhatsAppEditor = ({
  setEditorState,
  sendMessage,
  editorState,
  handleHeightChange,
  readOnly = false,
}: WhatsAppEditorProps) => {
  const { t } = useTranslation();

  const handleChange = (editorStateChange: any) => {
    setEditorState(editorStateChange);
  };

  const handleKeyCommand = (command: string, editorStateChange: any) => {
    // On enter, submit. Otherwise, deal with commands like normal.
    if (command === 'enter') {
      // Convert Draft.js to WhatsApp
      sendMessage(getPlainTextFromEditor(editorStateChange));
      return 'handled';
    }

    if (command === 'underline') {
      return 'handled';
    }

    if (command === 'bold') {
      setEditorState(updatedValue('**', editorState));
    } else if (command === 'italic') {
      setEditorState(updatedValue('__', editorState));
    } else {
      const newState = RichUtils.handleKeyCommand(editorStateChange, command);
      if (newState) {
        setEditorState(newState);
        return 'handled';
      }
    }
    return 'not-handled';
  };

  const keyBindingFn = (e: any) => {
    // Shift-enter is by default supported. Only 'enter' needs to be changed.
    if (e.keyCode === 13 && !e.nativeEvent.shiftKey) {
      return 'enter';
    }
    return getDefaultKeyBinding(e);
  };

  const onResize = useCallback((width: number | undefined, height: number | undefined) => {
    if (height) {
      handleHeightChange(height - 40);
    }
  }, []);

  const { ref } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 1000,
    onResize,
  });

  return (
    <div className={styles.Editor} ref={ref} data-testid="resizer">
      <Editor
        data-testid="editor"
        editorState={editorState}
        onChange={handleChange}
        handleKeyCommand={handleKeyCommand}
        keyBindingFn={keyBindingFn}
        placeholder={t('Type a message...')}
        readOnly={readOnly}
      />
    </div>
  );
};

export default WhatsAppEditor;
