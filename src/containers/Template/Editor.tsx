import styles from './Editor.module.css';
import { forwardRef, useState, useEffect } from 'react';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import {
  $getSelection,
  $createTextNode,
  $getRoot,
  $createParagraphNode,
  KEY_DOWN_COMMAND,
  COMMAND_PRIORITY_LOW,
} from 'lexical';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { useResizeDetector } from 'react-resize-detector';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { FormHelperText } from '@mui/material';
import {
  BeautifulMentionsPlugin,
  BeautifulMentionsMenuProps,
  BeautifulMentionsMenuItemProps,
} from 'lexical-beautiful-mentions';
import { useParams } from 'react-router';

export interface EditorProps {
  type?: any;
  field: { name: string; onChange?: any; value: any; onBlur: any };
  disabled?: any;
  label: string;
  form?: { touched: any; errors: any };
  placeholder: any;
  rows?: number;
  helperText?: any;
  picker?: any;
  textArea?: boolean;
  togglePassword?: boolean;
  endAdornmentCallback?: any;
  validate?: any;
  endAdornment?: any;
  inputProp?: any;
  translation?: string;
  onChange?: any;
}

export const Editor = ({ textArea = false, disabled = false, ...props }: EditorProps) => {
  const [editorState, setEditorState] = useState<any>('');
  const { field, form, picker, placeholder, onChange } = props;
  const mentions = props.inputProp?.suggestions || [];
  const suggestions = {
    '@': mentions.map((mention: string) => mention?.split('@')[1]),
  };
  const params = useParams();

  let isEditing = false;
  if (params.id) {
    isEditing = true;
  }

  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (field.value && isEditing && !editorState) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(field.value || ''));
        root.append(paragraph);
      });
    }
  }, [field.value]);

  const { ref } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 1000,
  });

  const Placeholder = () => {
    return <p className={styles.editorPlaceholder}>{placeholder}</p>;
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

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        let formatter = '';
        if (event.code === 'Enter') {
          event.preventDefault(); // Prevent line break on enter
        } else if ((event.ctrlKey || event.metaKey) && event.code === 'KeyB') {
          formatter = 'bold';
        } else if ((event.ctrlKey || event.metaKey) && event.code === 'KeyI') {
          formatter = 'italic';
        } else if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
          formatter = 'strikethrough';
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

  const handleChange = (editorState: any) => {
    editorState.read(() => {
      const root = $getRoot();
      if (!disabled) {
        onChange(root.getTextContent());
        setEditorState(root.getTextContent());
      }
    });
  };

  return (
    <div className={styles.EditorWrapper}>
      <div className={disabled ? styles?.disabled : styles.Editor} ref={ref} data-testid="resizer">
        <PlainTextPlugin
          data-testid="editor"
          placeholder={<Placeholder />}
          contentEditable={
            <div className={styles.editorScroller}>
              <div className={styles.editor}>
                <ContentEditable
                  data-testid={'editor'}
                  disabled={disabled}
                  className={styles.EditorInput}
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <BeautifulMentionsPlugin
          menuComponent={CustomMenu}
          menuItemComponent={CustomMenuItem}
          triggers={['@']}
          items={suggestions}
        />
        <OnChangePlugin onChange={handleChange} />
        {picker}
      </div>
      {form && form.errors[field.name] && form.touched[field.name] ? (
        <FormHelperText className={styles.DangerText}>{form.errors[field.name]}</FormHelperText>
      ) : null}
      {props.helperText && (
        <FormHelperText className={styles.HelperText}>{props.helperText}</FormHelperText>
      )}
    </div>
  );
};

const CustomMenu = forwardRef<HTMLUListElement, BeautifulMentionsMenuProps>(
  ({ open, loading, ...props }, ref) => <ul className={styles.MentionMenu} {...props} ref={ref} />
);

const CustomMenuItem = forwardRef<HTMLLIElement, BeautifulMentionsMenuItemProps>(
  ({ selected, item, ...props }, ref) => <li {...props} ref={ref} />
);
