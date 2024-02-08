import styles from './Editor.module.css';
import { forwardRef, useState } from 'react';
import { useEffect } from 'react';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { $getSelection, $createTextNode, $getRoot, $createParagraphNode } from 'lexical';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { useResizeDetector } from 'react-resize-detector';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { KEY_DOWN_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical';
import { ClickAwayListener, FormHelperText, IconButton, InputAdornment } from '@mui/material';
import {
  BeautifulMentionsPlugin,
  BeautifulMentionsMenuProps,
  BeautifulMentionsMenuItemProps,
} from 'lexical-beautiful-mentions';
import EmojiPicker from 'components/UI/EmojiPicker/EmojiPicker';

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

type MentionsProps = {
  mentions: any;
};

export const Editor = ({ textArea = false, disabled = false, ...props }: EditorProps) => {
  const { field, form, picker, placeholder, onChange } = props;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const mentions = props.inputProp?.suggestions || [];
  const suggestions = {
    '@': mentions.map((el: any) => el?.split('@')[1]),
  };

  const [editor] = useLexicalComposerContext();

  const { ref } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 1000,
  });

  const Placeholder = () => {
    return <p className={styles.editorPlaceholder}>{placeholder}</p>;
  };

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(field.value || ''));
      root.append(paragraph);
    });
  }, []);

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

  const MyCustomAutoFocusPlugin = () => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
      return editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event: KeyboardEvent) => {
          // Handle event here
          let formatter = '';
          if (event.code === 'Enter') {
            event.preventDefault(); // Prevent line break on enter
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

    return null;
  };

  const handleChange = (editorState: any) => {
    editorState.read(() => {
      const root = $getRoot();
      onChange(root.getTextContent());
    });
  };

  const emojiStyles = {
    position: 'absolute',
    bottom: '60px',
    right: '-150px',
    zIndex: 100,
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
                <ContentEditable disabled={disabled} className={styles.EditorInput} />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <MyCustomAutoFocusPlugin />
        <BeautifulMentionsPlugin
          menuComponent={CustomMenu}
          menuItemComponent={CustomMenuItem}
          triggers={['@']}
          items={suggestions}
        />
        {/* <MentionsPlugin suggestions={suggestions} /> */}
        <OnChangePlugin onChange={handleChange} />
        {picker && (
          <ClickAwayListener
            onClickAway={() => {
              setShowEmojiPicker(false);
            }}
          >
            <InputAdornment className={styles.EmojiPosition} position="end">
              <IconButton
                color="primary"
                data-testid="emoji-picker"
                aria-label="pick emoji"
                component="span"
                className={styles.Emoji}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <span role="img" aria-label="pick emoji">
                  😀
                </span>
              </IconButton>

              {showEmojiPicker && (
                <EmojiPicker onEmojiSelect={() => {}} displayStyle={emojiStyles} />
              )}
            </InputAdornment>
          </ClickAwayListener>
        )}
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
