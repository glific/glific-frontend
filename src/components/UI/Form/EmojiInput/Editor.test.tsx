import '../../../../matchMediaMock';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from './Editor';
import { LexicalWrapper } from 'common/LexicalWrapper';

const setFieldValueMock = vi.fn();

const mockIntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

const lexicalChange = vi.fn;

(window as any).IntersectionObserver = mockIntersectionObserver;

const wrapper = (
  <LexicalWrapper>
    <Editor
      isEditing={false}
      field={{ name: 'body', value: '', onBlur: () => {} }}
      placeholder={''}
      onChange={lexicalChange}
    />
  </LexicalWrapper>
);

it('should render lexical editor', () => {
  const { getByTestId } = render(wrapper);

  expect(getByTestId('editor-body')).toBeInTheDocument();
});

it('shoul open contact variables dropdown', async () => {
  const { getByTestId } = render(wrapper);
  const editor = getByTestId('editor-body');

  await userEvent.click(editor);
  await userEvent.tab();
  userEvent.keyboard('ddd');
  //   await fireEvent.input(editor, { data: 'this text is bold' });
  screen.debug();
});

// it('should render make text bold', async () => {
//   const { getByTestId } = render(wrapper);
//   const editor = getByTestId('editor-body');
//   await userEvent.click(editor);
//   //   await userEvent.keyboard('this text is bold');
//   await userEvent.tab();
//   act(async () => {
//     await fireEvent.input(editor, { data: 'this text is bold' });
//   });
//   screen.debug();
//   expect(getByTestId('editor-body')).toBeInTheDocument();
// });
