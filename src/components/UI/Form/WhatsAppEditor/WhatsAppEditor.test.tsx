import React from 'react';
import WhatsAppEditor from './WhatsAppEditor';
import { render, wait, fireEvent } from '@testing-library/react';
import { EMPTY_STATE } from './EditorState.test.helper';
import { EditorState } from 'draft-js';
import { WhatsAppToDraftEditor } from '../../../../common/RichEditor';

describe('<WhatsAppEditor/>', () => {
  let handleHeightChange = jest.fn();
  let sendMessage = jest.fn();
  let editorState = EMPTY_STATE;
  let setEditorState = jest.fn();

  const defaultProps = (editorState: any) => {
    return {
      handleHeightChange: handleHeightChange,
      sendMessage: sendMessage,
      editorState: editorState,
      setEditorState: setEditorState,
    };
  };

  

  test('it should have editor and emoji components', () => {
    const { container, getByTestId } = render(
      <WhatsAppEditor
        {...defaultProps(
          EditorState.createWithContent(WhatsAppToDraftEditor('Hello'))
        )}
      />
    );
    expect(container.querySelector('.Editor')).toBeInTheDocument();
    expect(getByTestId('emoji-picker')).toBeInTheDocument();
  });

  // test('input change should trigger callBacks', () => {
  //   editor.simulate('change', EMPTY_STATE);
  //   expect(setEditorState).toHaveBeenCalled();
  // });

  // Cannot successfully test 'handleKeyCommand', due to lack of Enzyme integration with DraftJS.

  // test('handleKeyCommand should work with new commands', () => {
  //   editor.props().handleKeyCommand('bold', EMPTY_STATE);
  //   expect(setEditorState).toHaveBeenCalled();
  // });

  // test('keyBindingFn should be able to override an enter key as sendMessage instead of new line', () => {
  //   const overrideEnter = editor
  //     .props()
  //     .keyBindingFn({ keyCode: 13, nativeEvent: { shiftKey: false } });
  //   expect(overrideEnter).toBe('enter');
  // });

  // test('testing change size callback', () => {
  //   const resizer = wrapper.find('[data-testid="resizer"]');
  //   resizer.props().onResize(40, 40);
  //   expect(handleHeightChange).toHaveBeenCalled();
  // });

  test('input an emoji in chat', () => {
    const { container, getByTestId } = render(
      <WhatsAppEditor
        {...defaultProps(
          EditorState.createWithContent(WhatsAppToDraftEditor('*this is bold* _this is italic_'))
        )}
      />
    );
    fireEvent.click(getByTestId('emoji-picker'));
    fireEvent.click(container.querySelector('.emoji-mart-emoji'));
    expect(setEditorState).toBeCalled();
  });
});
