import { render, fireEvent } from '@testing-library/react';
import draftJs, { EditorState, ContentState, SelectionState, RichUtils } from 'draft-js';
import { vi } from 'vitest';

import { WhatsAppEditor, updatedValue } from './WhatsAppEditor';

const mockHandleKeyCommand = vi.fn();

vi.spyOn(draftJs, 'Editor').mockImplementation((props: any, _context: any) => {
  const input: any = (
    <input
      data-testid="editor"
      onClick={() => {
        props.handleKeyCommand('underline');
        mockHandleKeyCommand();
      }}
      onChange={(event) => props.onChange(event)}
    ></input>
  );
  return input;
});

describe('<WhatsAppEditor/>', () => {
  const handleHeightChange = vi.fn();
  const sendMessage = vi.fn();
  const setEditorState = vi.fn();

  const defaultProps = (editorState: any) => {
    return {
      handleHeightChange: handleHeightChange,
      sendMessage: sendMessage,
      editorState: editorState,
      setEditorState: setEditorState,
    };
  };

  const editorContent = EditorState.createWithContent(ContentState.createFromText('Hello'));

  function mockEditorCommands(command: string) {
    vi.spyOn(draftJs, 'Editor').mockImplementation((props: any, _context: any) => {
      const input: any = (
        <input
          data-testid='editor'
          onClick={() => {
            props.handleKeyCommand(command);
          }}
          onChange={(event) => props.onChange(event)}
        ></input>
      );
      return input;
    });
  }

  test('input change should trigger callBacks', () => {
    const { getByTestId } = render(<WhatsAppEditor {...defaultProps(editorContent)} />);
    fireEvent.change(getByTestId('editor'), {
      target: { value: 10 },
    });
    expect(setEditorState).toHaveBeenCalled();
  });

  test('handleKeyCommand should work with new commands', () => {
    const { getByTestId } = render(<WhatsAppEditor {...defaultProps(editorContent)} />);
    fireEvent.click(getByTestId('editor'));

    expect(mockHandleKeyCommand).toHaveBeenCalled();
  });

  test('testing change size callback', () => {
    const { getByTestId } = render(<WhatsAppEditor {...defaultProps(editorContent)} />);
    fireEvent.click(getByTestId('resizer'));
    expect(handleHeightChange).toHaveBeenCalled();
  });

  test('testing function updatedValue', () => {
    // No selection with cursor at the beg
    const selection = new SelectionState({
      anchorKey: editorContent.getCurrentContent().getFirstBlock().getKey(),
      anchorOffset: 0,
      focusKey: editorContent.getCurrentContent().getFirstBlock().getKey(),
      focusOffset: 0,
    });

    editorContent.getSelection = vi.fn().mockReturnValue(selection);

    // Write 'Test' in the editor
    const updatedEditorState = updatedValue('Test', editorContent);
    const resultText = updatedEditorState.getCurrentContent().getPlainText();

    expect(resultText).toBe('TestHello');
  });

  test('testing Enter Key Command',() => {
    vi.mock('common/RichEditor', () => ({
      getPlainTextFromEditor: vi.fn()
    }));
    mockEditorCommands('enter')
    const { getByTestId } = render(<WhatsAppEditor {...defaultProps(editorContent)} />);
    fireEvent.click(getByTestId('editor'));
    expect(sendMessage).toHaveBeenCalled();
  })

  test('testing Bold Command', () => {
    mockEditorCommands('bold')
    const { getByTestId } = render(<WhatsAppEditor {...defaultProps(editorContent)} />);
    fireEvent.click(getByTestId('editor'));
    expect(setEditorState).toHaveBeenCalled();
  })

  test('testing italic Command', () => {
    mockEditorCommands('italic')
    const { getByTestId } = render(<WhatsAppEditor {...defaultProps(editorContent)} />);
    fireEvent.click(getByTestId('editor'));
    expect(setEditorState).toHaveBeenCalled();
  })

  test('testing custom Command', () => {
    vi.spyOn(RichUtils, 'handleKeyCommand').mockImplementation(() => null);
    mockEditorCommands('myCommand')
    const { getByTestId } = render(<WhatsAppEditor {...defaultProps(editorContent)} />);
    fireEvent.click(getByTestId('editor'));
    expect(RichUtils.handleKeyCommand).toHaveBeenCalled();
  })



  // since we are mocking emoji mart picker we need to implement the following functionalities

  // test('input an emoji in chat', () => {
  //   const { container, getByTestId } = render(
  //     <WhatsAppEditor
  //       {...defaultProps(
  //         EditorState.createWithContent(
  //           ContentState.createFromText('*this is bold* _this is italic_')
  //         )
  //       )}
  //     />
  //   );
  //   fireEvent.click(getByTestId('emoji-picker'));
  //   fireEvent.click(container.querySelector('.emoji-mart-emoji') as Element);
  //   expect(setEditorState).toBeCalled();
  // });
});
