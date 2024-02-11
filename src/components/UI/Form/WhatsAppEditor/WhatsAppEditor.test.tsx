import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import WhatsAppEditor from './WhatsAppEditor';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { userEvent } from '@testing-library/user-event';

const mockObserve = vi.fn();
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: mockObserve,
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

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
    expect(setEditorState).toHaveBeenCalled();
  });

  test('text is changed in lexical editor', async () => {
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

    const editor = screen.getByTestId('editor');
    console.log(editor);

    await userEvent.click(editor);
    await userEvent.tab();
    fireEvent.input(editor, { data: 'test' });

    await waitFor(() => {
      expect(editor).toHaveTextContent('test');
    });
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
