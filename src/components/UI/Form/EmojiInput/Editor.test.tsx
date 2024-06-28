import 'mocks/matchMediaMock';
import { render } from '@testing-library/react';
import { Editor } from './Editor';
import { LexicalWrapper } from 'common/LexicalWrapper';

const mockIntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

const handleChange = vi.fn;

(window as any).IntersectionObserver = mockIntersectionObserver;

const wrapper = (
  <LexicalWrapper>
    <Editor
      field={{ name: 'body', value: '', onBlur: () => {} }}
      placeholder={''}
      onChange={handleChange}
    />
  </LexicalWrapper>
);

it('should render lexical editor', () => {
  const { getByTestId } = render(wrapper);
  expect(getByTestId('editor-body')).toBeInTheDocument();
});
