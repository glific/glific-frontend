import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import WhatsAppEditor from './WhatsAppEditor';
import { userEvent } from '@testing-library/user-event';
import { LexicalWrapper } from 'common/LexicalWrapper';

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
      <LexicalWrapper>
        <WhatsAppEditor {...defaultProps()} />
      </LexicalWrapper>
    );

    await userEvent.click(getByTestId('editor'));
    await userEvent.tab();
    await fireEvent.input(getByTestId('editor'), { data: 'test' });

    expect(getByTestId('editor')).toHaveTextContent('test');
  });

  test('text is changed in lexical editor', async () => {
    render(
      <LexicalWrapper>
        <WhatsAppEditor {...defaultProps()} />
      </LexicalWrapper>
    );

    const editor = screen.getByTestId('editor');

    await userEvent.click(editor);
    await userEvent.tab();
    fireEvent.input(editor, { data: 'test' });

    await waitFor(() => {
      expect(editor).toHaveTextContent('test');
    });
  });

  test('resize observer event is called', async () => {
    render(
      <LexicalWrapper>
        <WhatsAppEditor {...defaultProps()} />
      </LexicalWrapper>
    );
    await waitFor(() => {
      expect(mockObserve).toHaveBeenCalled();
    });
  });
});
