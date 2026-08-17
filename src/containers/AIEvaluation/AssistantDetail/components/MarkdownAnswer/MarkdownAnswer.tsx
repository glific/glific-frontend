import Markdown from 'react-markdown';
import { splitMarkdownTables } from 'containers/AIEvaluation/utils/markdownTable/markdownTable';
import { normalizeLineBreaks } from 'containers/AIEvaluation/utils/sandbox/sandbox';
import styles from './MarkdownAnswer.module.css';

/** an answer's links point away from the app, so they open in a new tab */
const LINK_IN_NEW_TAB = {
  a: ({ node, ...props }: any) => <a {...props} target="_blank" rel="noopener noreferrer" />,
};

export interface MarkdownAnswerProps {
  text: string;
  className?: string;
}

/**
 * Renders an assistant's answer. Pipe tables are drawn here because the markdown renderer only
 * understands CommonMark, which has no tables; everything else is markdown as usual.
 */
export const MarkdownAnswer = ({ text, className }: MarkdownAnswerProps) => (
  <div className={`${styles.Markdown} ${className ?? ''}`} data-testid="markdownAnswer">
    {splitMarkdownTables(normalizeLineBreaks(text)).map((block, index) =>
      block.type === 'table' ? (
        <div className={styles.TableWrap} key={`table-${index}`}>
          <table className={styles.Table}>
            <thead>
              <tr>
                {block.table.header.map((cell, cellIndex) => (
                  <th key={`head-${cellIndex}`}>
                    <Markdown components={LINK_IN_NEW_TAB}>{cell}</Markdown>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.table.rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`cell-${cellIndex}`}>
                      <Markdown components={LINK_IN_NEW_TAB}>{cell}</Markdown>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Markdown key={`text-${index}`} components={LINK_IN_NEW_TAB}>
          {block.content}
        </Markdown>
      )
    )}
  </div>
);

export default MarkdownAnswer;
