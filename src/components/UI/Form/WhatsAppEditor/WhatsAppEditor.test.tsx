import React from 'react';
import { shallow, mount } from 'enzyme';
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

  const getWrapper = (editorState: any) =>
    shallow(<WhatsAppEditor {...defaultProps(editorState)} />);

  const wrapper = getWrapper(EMPTY_STATE);
  const editor = wrapper.find('[data-testid="editor"]');
  const emojiPicker = wrapper.find('[data-testid="emoji-picker"]');

  test('it should have editor and emoji components', () => {
    expect(editor).toHaveLength(1);
    expect(emojiPicker).toHaveLength(1);
  });

  test('input change should trigger callBacks', () => {
    editor.simulate('change', EMPTY_STATE);
    expect(setEditorState).toHaveBeenCalled();
  });

  // Cannot successfully test 'handleKeyCommand', due to lack of Enzyme integration with DraftJS.

  // test('handleKeyCommand should work with new commands', () => {
  //   editor.props().handleKeyCommand('bold', EMPTY_STATE);
  //   expect(setEditorState).toHaveBeenCalled();
  // });

  test('keyBindingFn should be able to override an enter key as sendMessage instead of new line', () => {
    const overrideEnter = editor
      .props()
      .keyBindingFn({ keyCode: 13, nativeEvent: { shiftKey: false } });
    expect(overrideEnter).toBe('enter');
  });

  test('testing change size callback', () => {
    const resizer = wrapper.find('[data-testid="resizer"]');
    resizer.props().onResize(40, 40);
    expect(handleHeightChange).toHaveBeenCalled();
  });

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
