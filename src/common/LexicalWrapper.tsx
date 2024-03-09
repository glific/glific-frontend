import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { BeautifulMentionNode } from 'lexical-beautiful-mentions';

interface LexicalWrapperProps {
  children: any;
}

export const LexicalWrapper = ({ children }: LexicalWrapperProps) => {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: 'template-input',
        onError: (error) => console.log(error),
        nodes: [BeautifulMentionNode],
      }}
    >
      {children}
    </LexicalComposer>
  );
};
