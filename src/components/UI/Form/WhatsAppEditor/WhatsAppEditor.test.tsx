import { render, fireEvent, waitFor } from '@testing-library/react';
import draftJs, { EditorState, ContentState } from 'draft-js';
import { vi } from 'vitest';

import WhatsAppEditor from './WhatsAppEditor';

const mockHandleKeyCommand = vi.fn();

const mockObserve = vi.fn();
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: mockObserve,
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

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

  test('resize observer event is called', async () => {
    render(<WhatsAppEditor {...defaultProps(editorContent)} />);
    await waitFor(() => {
      expect(mockObserve).toHaveBeenCalled();
    });
  });

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
