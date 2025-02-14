import styles from './Editor.module.css';
import { forwardRef, useEffect, useState } from 'react';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import {
  $getSelection,
  $createTextNode,
  $getRoot,
  KEY_DOWN_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  $createRangeSelection,
  $setSelection,
  $isRangeSelection,
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
import { handleFormatterEvents, handleFormatting, setDefaultValue } from 'common/RichEditor';
import { FormatBold, FormatItalic, StrikethroughS, Code } from '@mui/icons-material';
import { mergeRegister } from '@lexical/utils';

export interface EditorProps {
  field: { name: string; onChange?: any; value: any; onBlur?: any };
  disabled?: any;
  form?: { touched: any; errors: any; setFieldValue: any; values: any };
  placeholder: string;
  helperText?: string;
  picker?: any;
  inputProp?: any;
  onChange?: any;
  defaultValue?: any;
}

export const Editor = ({ disabled = false, ...props }: EditorProps) => {
  const { field, form, picker, placeholder, onChange, defaultValue } = props;
  const mentions = props.inputProp?.suggestions || [];
  const suggestions = {
    '@': mentions.map((mention: string) => mention?.split('@')[1]),
  };
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (defaultValue || defaultValue === '') {
      setDefaultValue(editor, defaultValue);
    }
  }, [defaultValue]);

  const Placeholder = () => {
    return <p className={styles.editorPlaceholder}>{placeholder}</p>;
  };

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
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
      ),
      editor.registerCommand(
        FORMAT_TEXT_COMMAND,
        (event: any) => {
          editor.update(() => {
            const selection = $getSelection();
            const text = handleFormatting(selection?.getTextContent(), event);

            if (!selection?.getTextContent()) {
              const newNode = $createTextNode(text);
              selection?.insertNodes([newNode]);

              const newSelection = $createRangeSelection();
              newSelection.anchor.set(newNode.getKey(), 1, 'text');
              newSelection.focus.set(newNode.getKey(), 1, 'text');
              $setSelection(newSelection);
            }
            if (selection?.getTextContent() && event) {
              const newNode = $createTextNode(text);
              selection?.insertNodes([newNode]);
              editor.focus();
            }
          });
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  useEffect(() => {
    if (disabled) {
      editor.setEditable(false);
    }
  }, [disabled]);

  const handleChange = (editorState: any) => {
    editorState.read(() => {
      const root = $getRoot();
      if (!disabled) {
        onChange(root.getTextContent());
        form?.setFieldValue(field?.name, root.getTextContent());
      }
    });
  };

  const [activeFormats, setActiveFormats] = useState<{ bold: boolean; italic: boolean; strikethrough: boolean }>({
    bold: false,
    italic: false,
    strikethrough: false,
  });

  useEffect(() => {
    const checkFormatting = () => {
      editor.update(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          setActiveFormats({ bold: false, italic: false, strikethrough: false });
          return;
        }

        const anchorNode = selection.anchor.getNode();
        const anchorOffset = selection.anchor.offset;

        if (!anchorNode.getTextContent()) {
          setActiveFormats({ bold: false, italic: false, strikethrough: false });
          return;
        }

        const textContent = anchorNode.getTextContent();

        const boldRegex = /\*(?:\S.*?\S|\S)\*/g;
        const italicRegex = /_(.*?)_/g;
        const strikethroughRegex = /~(.*?)~/g;

        const isInsideFormat = (regex: RegExp) => {
          let match;
          while ((match = regex.exec(textContent)) !== null) {
            const start = match.index;
            const end = start + match[0].length;
            if (anchorOffset > start && anchorOffset < end) {
              return true;
            }
          }
          return false;
        };

        setActiveFormats({
          bold: isInsideFormat(boldRegex),
          italic: isInsideFormat(italicRegex),
          strikethrough: isInsideFormat(strikethroughRegex),
        });
      });
    };

    // Register an update listener to track selection changes
    const removeListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        checkFormatting();
      });
    });

    return () => {
      removeListener();
    };
  }, [editor]);

  return (
    <>
      <div className={styles.EditorWrapper}>
        <div className={styles.FormatingOptions}>
          <span
            className={activeFormats.bold ? styles.Active : ''}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
            }}
          >
            <FormatBold fontSize="small" color="inherit" />
          </span>
          <span
            className={activeFormats.italic ? styles.Active : ''}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
            }}
          >
            <FormatItalic fontSize="small" color="inherit" />
          </span>
          <span
            className={activeFormats.strikethrough ? styles.Active : ''}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
            }}
          >
            <StrikethroughS fontSize="small" color="inherit" />
          </span>
          <span
            className={activeFormats.strikethrough ? styles.Active : ''}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
            }}
          >
            <Code fontSize="small" color="inherit" />
          </span>
        </div>
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
      </div>
      {form && form.errors[field.name] && form.touched[field.name] ? (
        <FormHelperText className={styles.DangerText}>{form.errors[field.name]}</FormHelperText>
      ) : null}
      {props.helperText && <FormHelperText className={styles.HelperText}>{props.helperText}</FormHelperText>}
    </>
  );
};

const CustomMenu = forwardRef<HTMLUListElement, BeautifulMentionsMenuProps>(({ open, loading, ...props }, ref) => (
  <ul className={styles.MentionMenu} {...props} ref={ref} />
));

const CustomMenuItem = forwardRef<HTMLLIElement, BeautifulMentionsMenuItemProps>(
  ({ selected, item, ...props }, ref) => {
    return <li aria-selected={selected} className={selected ? styles.Selected : ''} {...props} ref={ref} />;
  }
);
