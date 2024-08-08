import { render } from '@testing-library/react';
import { Editor } from './Editor';
import { LexicalWrapper } from 'common/LexicalWrapper';

const mockIntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

const handleChange = vi.fn();

(window as any).IntersectionObserver = mockIntersectionObserver;

vi.mock('lexical-beautiful-mentions', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('lexical-beautiful-mentions');
  return {
    ...actual,
    BeautifulMentionsPlugin: ({ children }: any) => <div>{children}</div>,
    BeautifulMentionsMenuProps: {},
    BeautifulMentionsMenuItemProps: {},
  };
});

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
