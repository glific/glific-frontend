import { useEffect } from 'react';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import {
  $getSelection,
  $createTextNode,
  $getRoot,
  KEY_DOWN_COMMAND,
  COMMAND_PRIORITY_LOW,
} from 'lexical';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { useResizeDetector } from 'react-resize-detector';

import styles from './WhatsAppEditor.module.css';
import { handleFormatterEvents, handleFormatting } from 'common/RichEditor';

interface WhatsAppEditorProps {
  sendMessage(message: any): void;
  setEditorState(editorState: any): void;
  readOnly?: boolean;
}

export const WhatsAppEditor = ({
  setEditorState,
  sendMessage,
  readOnly = false,
}: WhatsAppEditorProps) => {
  const [editor] = useLexicalComposerContext();

  const { ref } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 1000,
  });

  const onChange = (editorState: any) => {
    editorState.read(() => {
      const root = $getRoot();
      setEditorState(root.getTextContent());
    });
  };

  useEffect(() => {
    if (readOnly) {
      editor.setEditable(false);
    }
  }, [readOnly]);

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        // Handle event here
        let formatter = '';
        if (event.code === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          const root = $getRoot();
          let textMessage = root.getTextContent();
          sendMessage(textMessage);
          return true;
        } else {
          formatter = handleFormatterEvents(event);
        }

        editor.update(() => {
          const selection = $getSelection();
          if (selection?.getTextContent() && formatter) {
            const text = handleFormatting(selection?.getTextContent(), formatter);
            const newNode = $createTextNode(text);
            selection?.insertNodes([newNode]);
          }
        });

        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, sendMessage]);

  const Placeholder = () => {
    return <div className={styles.editorPlaceholder}>Type a message...</div>;
  };

  return (
    <div className={`${styles.Editor} LexicalEditor`} ref={ref} data-testid="resizer">
      <PlainTextPlugin
        data-testid="editor"
        placeholder={<Placeholder />}
        contentEditable={<ContentEditable data-testid={'editor'} className={styles.editorInput} />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <ClearEditorPlugin />
      <HistoryPlugin />
      <OnChangePlugin onChange={onChange} />
    </div>
  );
};

export default WhatsAppEditor;
