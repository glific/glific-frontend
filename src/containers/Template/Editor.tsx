import styles from './Editor.module.css';
import { forwardRef, useCallback, useState } from 'react';
import { useEffect } from 'react';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { $getSelection, $createTextNode, $getRoot } from 'lexical';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { useResizeDetector } from 'react-resize-detector';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useTranslation } from 'react-i18next';
import { KEY_DOWN_COMMAND, COMMAND_PRIORITY_LOW, $isRangeSelection, createCommand } from 'lexical';
import styled from '@emotion/styled';
import {
  ClickAwayListener,
  FormHelperText,
  IconButton,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import { Input } from 'components/UI/Form/Input/Input';
import {
  BeautifulMentionsPlugin,
  BeautifulMentionNode,
  BeautifulMentionsMenuProps,
  BeautifulMentionsTheme,
  BeautifulMentionsMenuItemProps,
  BeautifulMentionComponentProps,
  createBeautifulMentionNode,
} from 'lexical-beautiful-mentions';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

export interface EditorProps {
  type?: any;
  field: { name: string; onChange?: any; value: any; onBlur: any };
  disabled?: any;
  editor?: any;
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
  const {
    field,
    form,
    helperText,
    type,
    togglePassword,
    endAdornmentCallback,
    picker,
    placeholder,
    editor,
    rows,
    endAdornment,
    inputProp,
    translation,
    onChange,
  } = props;
  const onResize = useCallback((height: any) => {
    // handleHeightChange(height - 40);
  }, []);

  //   const { getEditorValue } = props;
  const onError = (error: any) => {
    console.error(error);
  };

  const beautifulMentionsTheme: BeautifulMentionsTheme = {
    // 👇 use the trigger name as the key
    '@': 'px-1 mx-px ...',
    // 👇 add the "Focused" suffix to style the focused mention
    '@Focused': 'outline-none shadow-md ...',
    // 👇 use a configuration object if you need to apply different styles to trigger and value
    'due:': {
      trigger: 'text-blue-400 ...',
      value: 'text-orange-400 ...',
    },
  };
  const exampleTheme = {
    ltr: 'ltr',
    rtl: 'rtl',
    paragraph: 'editor-paragraph',
    input: 'editor-input',
    beautifulMentions: beautifulMentionsTheme,
  };
  const value =
    '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

  const CustomMentionComponent = forwardRef<HTMLDivElement, BeautifulMentionComponentProps>(
    ({ trigger, value, data: myData, children, ...other }, ref) => {
      return (
        <div className={styles.boxii} {...other} ref={ref} title={trigger + value}>
          {value}
        </div>
      );
    }
  );

  const initialConfig = {
    namespace: 'MyEditor',
    onError,
    theme: exampleTheme,
    paragraph: 'editor-paragraph',
    input: 'editor-input',
    nodes: [...createBeautifulMentionNode(CustomMentionComponent)],
  };

  const mentions = props.inputProp?.suggestions || [];

  const suggestions = {
    '@': mentions,
  };

  console.log(mentions);

  const { ref } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 1000,
    onResize,
  });
  function Placeholder() {
    return '';
  }
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
  }

  const MuiContentEditable = styled(ContentEditable)({
    minHeight: '150px',
    outline: 'none',
    width: '100%',
    position: 'relative',
    borderRadius: '8px',
    paddingRight: '14px',
    padding: '2px 14px',
    fontWeight: '400',
    border: '1px solid rgba(0, 0, 0, 0.23)',
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const ADD_EMOJI_COMMAND = createCommand();
  const AddEmojiPlugin = () => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
      return editor.registerCommand(
        ADD_EMOJI_COMMAND,
        (payload: string) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertNodes([$createTextNode(payload)]);
          }
          return true;
        },
        1
      );
    }, [editor]);
    return (
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
            <Picker
              style={{ position: 'absolute', top: '1780px', right: '0px', zIndex: 2 }}
              data={data}
              theme="light"
              onEmojiSelect={(d: any) => {
                editor.dispatchCommand(ADD_EMOJI_COMMAND, d.native);
              }}
            />
          )}
        </InputAdornment>
      </ClickAwayListener>
    );
  };

  function onChangee(editorState: any) {
    editorState.read(() => {
      const root = $getRoot();
      console.log(root.getTextContent());

      onChange(root.getTextContent());
    });
  }

  return (
    <div className={styles.EditorWrapper}>
      <div className={styles.Editor} ref={ref} data-testid="resizer">
        <LexicalComposer initialConfig={initialConfig}>
          <PlainTextPlugin
            data-testid="editor"
            placeholder={<Placeholder />}
            contentEditable={<ContentEditable className={styles.EditorInput} />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <MyCustomAutoFocusPlugin />
          <BeautifulMentionsPlugin triggers={['@']} items={suggestions} />
          <OnChangePlugin onChange={onChangee} />
          {picker && <AddEmojiPlugin />}
        </LexicalComposer>
      </div>
      {props.helperText && (
        <FormHelperText className={styles.HelperText}>{props.helperText}</FormHelperText>
      )}
    </div>
  );
};
