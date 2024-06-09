import styles from './Editor.module.css';
import { forwardRef, useEffect } from 'react';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
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
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { FormHelperText } from '@mui/material';
import {
  BeautifulMentionsPlugin,
  BeautifulMentionsMenuProps,
  BeautifulMentionsMenuItemProps,
} from 'lexical-beautiful-mentions';
import { handleFormatterEvents, handleFormatting, setInitialState } from 'common/RichEditor';

export interface EditorProps {
  field: { name: string; onChange?: any; value: any; onBlur: any };
  disabled?: any;
  form?: { touched: any; errors: any; values?: any };
  placeholder: string;
  helperText?: string;
  picker?: any;
  inputProp?: any;
  onChange?: any;
  isEditing: boolean;
}

export const Editor = ({ disabled = false, isEditing = false, ...props }: EditorProps) => {
  const { field, form, picker, placeholder, onChange } = props;
  const mentions = props.inputProp?.suggestions || [];
  const suggestions = {
    '@': mentions.map((mention: string) => mention?.split('@')[1]),
  };
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (field.value || field.value !== '') {
      setInitialState(editor, field.value);
    }
  }, [field.value]);

  const Placeholder = () => {
    return <p className={styles.editorPlaceholder}>{placeholder}</p>;
  };

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        let formatter = handleFormatterEvents(event);

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

  // useEffect(() => {
  //   if (disabled) {
  //     editor.setEditable(false);
  //   }
  // }, [disabled]);

  const handleChange = (editorState: any) => {
    editorState.read(() => {
      const root = $getRoot();
      if (!disabled) {
        onChange(root.getTextContent());
      }
    });
  };

  return (
    <div className={styles.EditorWrapper}>
      <div className={disabled ? styles?.disabled : styles.Editor} data-testid="resizer">
        <PlainTextPlugin
          placeholder={<Placeholder />}
          contentEditable={
            <div className={styles.editorScroller}>
              <div className={styles.editor}>
                <ContentEditable
                  data-testid={`editor-${field.name}`}
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
  ({ selected, item, ...props }, ref) => {
    return (
      <li
        aria-selected={selected}
        className={selected ? styles.Selected : ''}
        {...props}
        ref={ref}
      />
    );
  }
);
