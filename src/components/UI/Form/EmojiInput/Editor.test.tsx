import '../../../../matchMediaMock';
import { render } from '@testing-library/react';
import { Editor } from './Editor';
import { LexicalWrapper } from 'common/LexicalWrapper';

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
