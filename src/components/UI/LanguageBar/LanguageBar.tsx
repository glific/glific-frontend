import React from 'react';

import Button from '@material-ui/core/Button';
import styles from './LanguageBar.module.css';

export interface LanguageBarProps {
  options: Array<string>;
  selectedLangauge: string | null;
  onLanguageChange: Function;
}

export const LanguageBar: React.SFC<LanguageBarProps> = ({
  options,
  selectedLangauge,
  onLanguageChange,
}) => {
  const isSelected = (option: string) => selectedLangauge && selectedLangauge === option;

  return (
    <div className={styles.LanguageWrapper}>
      {options.map((option: string) => (
        <Button
          key={option}
          color="primary"
          onClick={() => onLanguageChange(option)}
          className={`${isSelected(option) && styles.Selected} `}
        >
          {option}
        </Button>
      ))}
    </div>
  );
};
