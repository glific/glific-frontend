import { useCallback } from 'react';
import { useEffect } from 'react';

import { Modifier, EditorState } from 'draft-js';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { $getSelection, $createTextNode, CLEAR_EDITOR_COMMAND, $getRoot } from 'lexical';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { useResizeDetector } from 'react-resize-detector';
import { useTranslation } from 'react-i18next';
import { KEY_DOWN_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical';

import styles from './WhatsAppEditor.module.css';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

interface WhatsAppEditorProps {
  handleHeightChange(newHeight: number): void;
  sendMessage(message: any): void;
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

  const onResize = useCallback((height: any) => {
    handleHeightChange(height - 40);
  }, []);

  const { ref } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 1000,
    onResize,
  });

  const onChange = (editorState: any) => {
    editorState.read(() => {
      const root = $getRoot();
      setEditorState(root.getTextContent());
    });
  };

  const handleFormatting = (text: string, formatter: string) => {
    switch (formatter) {
      case 'bold':
        return `*${text}*`;
      case 'italic':
        return `_${text}_`;
      case 'strikethrough':
        return `~${text}~`;
      default:
        return text;
    }
  };

  function MyCustomAutoFocusPlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
      return editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event: KeyboardEvent) => {
          // Handle event here
          let formatter = '';
          if (event.code === 'Enter' && !readOnly) {
            event.preventDefault();

            if (
              editor.getRootElement()?.textContent &&
              typeof editor.getRootElement()?.textContent === 'string'
            ) {
              sendMessage(editor?.getRootElement()?.textContent);
            }
            // sendMessage()
            // Prevent line break on enter
          } else if ((event.ctrlKey || event.metaKey) && event.code === 'KeyB') {
            formatter = 'bold';
          } else if ((event.ctrlKey || event.metaKey) && event.code === 'KeyI') {
            formatter = 'italic';
          }

          // console.log(formatter);

          editor.update(() => {
            const selection = $getSelection();
            if (selection?.getTextContent() && formatter) {
              const text = handleFormatting(selection?.getTextContent(), formatter);
              const newNode = $createTextNode(text);
              selection?.insertNodes([newNode]);
            }
          });
          // console.log(event);

          return false;
        },
        COMMAND_PRIORITY_LOW
      );
    }, [editor, onChange]);

    return null;
  }
  function Placeholder() {
    return <div className={styles.editorPlaceholder}>Type a message...</div>;
  }

  return (
    <div className={styles.Editor} ref={ref} data-testid="resizer">
      <PlainTextPlugin
        data-testid="editor"
        placeholder={<Placeholder />}
        contentEditable={<ContentEditable className={styles.editorInput} />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <MyCustomAutoFocusPlugin />
      <OnChangePlugin onChange={onChange} />
    </div>
  );
};

export default WhatsAppEditor;
