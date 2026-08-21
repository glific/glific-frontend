import { WhatsAppToJsx } from 'common/RichEditor';
import { normalizeLineBreaks } from 'containers/AIEvaluation/utils/sandbox/sandbox';
import styles from './MarkdownAnswer.module.css';

export interface MarkdownAnswerProps {
  text: string;
  className?: string;
}

export const MarkdownAnswer = ({ text, className }: MarkdownAnswerProps) => (
  <div className={`${styles.Markdown} ${className ?? ''}`} data-testid="markdownAnswer">
    {WhatsAppToJsx(normalizeLineBreaks(text))}
  </div>
);
