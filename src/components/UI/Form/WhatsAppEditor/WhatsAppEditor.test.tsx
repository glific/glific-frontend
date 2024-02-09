import { render, fireEvent, waitFor } from '@testing-library/react';
import draftJs, { EditorState, ContentState } from 'draft-js';
import { vi } from 'vitest';

import WhatsAppEditor from './WhatsAppEditor';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { userEvent } from '@testing-library/user-event';

const mockHandleFormatting = vi.fn();

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
        mockHandleFormatting();
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

  const defaultProps = () => {
    return {
      handleHeightChange: handleHeightChange,
      sendMessage: sendMessage,
      setEditorState: setEditorState,
    };
  };

  const editorContent = EditorState.createWithContent(ContentState.createFromText('Hello'));

  test('input change should trigger callBacks', async () => {
    const { getByTestId } = render(
      <LexicalComposer
        initialConfig={{
          namespace: 'chat-input',
          onError: (error: any) => console.log(error),
        }}
      >
        <WhatsAppEditor {...defaultProps()} />
      </LexicalComposer>
    );

    await userEvent.click(getByTestId('editor'));
    await userEvent.keyboard('10');

    console.log(getByTestId('editor').innerText);

    expect(setEditorState).toHaveBeenCalled();
  });

  test('handleKeyCommand should work with new commands', async () => {
    const { getByTestId } = render(
      <LexicalComposer
        initialConfig={{
          namespace: 'chat-input',
          onError: (error: any) => console.log(error),
        }}
      >
        <WhatsAppEditor {...defaultProps()} />
      </LexicalComposer>
    );
    await userEvent.click(getByTestId('editor'));

    expect(mockHandleFormatting).toHaveBeenCalled();
  });

  test('resize observer event is called', async () => {
    render(
      <LexicalComposer
        initialConfig={{
          namespace: 'chat-input',
          onError: (error: any) => console.log(error),
        }}
      >
        <WhatsAppEditor {...defaultProps()} />
      </LexicalComposer>
    );
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
