import { useCallback, useEffect } from 'react';
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
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { useResizeDetector } from 'react-resize-detector';

import styles from './WhatsAppEditor.module.css';
import { getTextContent } from 'common/RichEditor';

interface WhatsAppEditorProps {
  handleHeightChange(newHeight: number): void;
  sendMessage(message: any): void;
  readOnly?: boolean;
}

export const WhatsAppEditor = ({
  sendMessage,
  handleHeightChange,
  readOnly = false,
}: WhatsAppEditorProps) => {
  const [editor] = useLexicalComposerContext();

  const onResize = useCallback((height: any) => {
    handleHeightChange(height - 40);
  }, []);

  const { ref } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 1000,
    onResize,
  });

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

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        // Handle event here
        let formatter = '';
        if (event.code === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          let textMessage = getTextContent(editor);
          sendMessage(textMessage);
          return true;
        } else if ((event.ctrlKey || event.metaKey) && event.code === 'KeyB') {
          formatter = 'bold';
        } else if ((event.ctrlKey || event.metaKey) && event.code === 'KeyI') {
          formatter = 'italic';
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
  }, [editor]);

  const Placeholder = () => {
    return <div className={styles.editorPlaceholder}>Type a message...</div>;
  };

  return (
    <div className={`${styles.Editor} LexicalEditor`} ref={ref} data-testid="resizer">
      <PlainTextPlugin
        data-testid="editor"
        placeholder={<Placeholder />}
        contentEditable={
          <ContentEditable
            value={undefined}
            data-testid={'editor'}
            className={styles.editorInput}
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
    </div>
  );
};

export default WhatsAppEditor;
