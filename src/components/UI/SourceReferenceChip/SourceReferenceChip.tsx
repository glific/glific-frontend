import MenuBookIcon from '@mui/icons-material/MenuBook';

import styles from './SourceReferenceChip.module.css';

export interface SourceReferenceChipProps {
  language: string;
  value?: string;
  titleOnly?: boolean;
  'data-testid'?: string;
}

export const SourceReferenceChip = ({
  language,
  value,
  titleOnly,
  'data-testid': testId,
}: SourceReferenceChipProps) => {
  if (!titleOnly && !value) return null;

  return (
    <div className={styles.SourceReferenceChip} data-testid={testId ?? 'source-reference-chip'}>
      <MenuBookIcon className={styles.SourceReferenceChipIcon} />
      <span>{titleOnly ? language : `${language}:`}</span>
      {!titleOnly && <span className={styles.SourceReferenceChipValue}>{value}</span>}
    </div>
  );
};

export default SourceReferenceChip;
